# ============================================================
# ChainGuard — Weather Router
# Live weather endpoints powered by OpenWeatherMap.
# ============================================================
from fastapi import APIRouter
from datetime import datetime, timezone

from services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather"])
weather_service = WeatherService()

MAJOR_HUBS = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata",
    "Hyderabad", "Pune", "Ahmedabad", "Lucknow", "Nagpur",
]


@router.get("/{city_name}")
async def get_city_weather(city_name: str):
    """Fetch current weather and logistics severity for a city."""
    try:
        result = await weather_service.fetch_city_weather(city_name)
        return {"success": True, "data": result, "message": f"Weather for {city_name}"}
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}


@router.get("/bulk/{cities}")
async def get_bulk_weather(cities: str):
    """Fetch weather for multiple comma-separated cities."""
    try:
        city_list = [c.strip() for c in cities.split(",") if c.strip()]
        results = await weather_service.fetch_multiple_cities(city_list)
        return {
            "success": True,
            "data": results,
            "count": len(results),
            "message": f"Weather for {len(results)} cities",
        }
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}


@router.get("/india/alerts")
async def get_india_weather_alerts():
    """Fetch weather alerts for India's 10 major logistics hubs."""
    try:
        results = await weather_service.fetch_multiple_cities(MAJOR_HUBS)
        alerts = [r for r in results if r.get("alert_level", "none") != "none"]
        return {
            "success": True,
            "data": {
                "active_weather_alerts": alerts,
                "all_cities": results,
                "total_cities_checked": len(MAJOR_HUBS),
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": f"{len(alerts)} active weather alerts",
        }
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}
