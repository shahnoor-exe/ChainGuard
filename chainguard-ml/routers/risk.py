# ============================================================
# ChainGuard — Risk Router
# City-level and India heatmap risk endpoints.
# ============================================================
import json
import random
import asyncio
from pathlib import Path
from fastapi import APIRouter
from datetime import datetime, timezone

from services.risk_engine import RiskEngine
from services.weather_service import WeatherService

router = APIRouter(prefix="/risk", tags=["Risk"])
risk_engine = RiskEngine()
weather_service = WeatherService()

# Load city data
_cities_path = Path(__file__).parent.parent / "data" / "india_cities.json"
with open(_cities_path, "r") as f:
    INDIA_CITIES = json.load(f)

# Pre-built mock heatmap for fallback
MOCK_RISK_SCORES = {
    "Mumbai": 45, "Delhi": 38, "Bangalore": 22, "Chennai": 50,
    "Hyderabad": 35, "Kolkata": 42, "Pune": 48, "Ahmedabad": 55,
    "Jaipur": 28, "Lucknow": 33, "Nagpur": 40, "Bhopal": 25,
    "Indore": 30, "Surat": 52, "Vadodara": 20, "Coimbatore": 18,
    "Kochi": 15, "Vizag": 60, "Patna": 35, "Chandigarh": 32,
    "Ludhiana": 44, "Amritsar": 38, "Guwahati": 27, "Bhubaneswar": 58,
    "Raipur": 30,
}


def _risk_label(score: int) -> str:
    if score <= 30:
        return "Low"
    if score <= 60:
        return "Medium"
    if score <= 80:
        return "High"
    return "Critical"


@router.get("/city/{city_name}")
async def get_city_risk(city_name: str):
    """Composite risk score for a single city."""
    try:
        result = await risk_engine.calculate_city_risk(city_name)
        return {"success": True, "data": result, "message": f"Risk for {city_name}"}
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}


@router.get("/india/heatmap")
async def get_india_heatmap():
    """Risk heatmap for all 25 Indian cities."""
    try:
        # Try to fetch live weather for all cities
        city_names = [c["name"] for c in INDIA_CITIES]
        weather_results = await weather_service.fetch_multiple_cities(city_names)

        heatmap = []
        for city_info, wx in zip(INDIA_CITIES, weather_results):
            # Simplified risk from weather score
            risk_score = min(int(wx["weather_score"] * 10 + random.randint(0, 10)), 100)
            heatmap.append({
                "city": city_info["name"],
                "lat": city_info["lat"],
                "lng": city_info["lng"],
                "state": city_info["state"],
                "risk_score": risk_score,
                "risk_label": _risk_label(risk_score),
                "weather_main": wx.get("weather_main", "Clear"),
                "weather_score": wx.get("weather_score", 1.0),
                "is_mock": wx.get("is_mock", False),
            })

        return {
            "success": True,
            "data": heatmap,
            "count": len(heatmap),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": "India risk heatmap",
        }
    except Exception as e:
        # Fallback mock heatmap
        print(f"[WARN] Heatmap fallback: {e}")
        heatmap = []
        for city_info in INDIA_CITIES:
            name = city_info["name"]
            score = MOCK_RISK_SCORES.get(name, random.randint(15, 55))
            heatmap.append({
                "city": name,
                "lat": city_info["lat"],
                "lng": city_info["lng"],
                "state": city_info["state"],
                "risk_score": score,
                "risk_label": _risk_label(score),
                "weather_main": "Clear",
                "weather_score": 2.0,
                "is_mock": True,
            })

        return {
            "success": True,
            "data": heatmap,
            "count": len(heatmap),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": "India risk heatmap (mock fallback)",
        }
