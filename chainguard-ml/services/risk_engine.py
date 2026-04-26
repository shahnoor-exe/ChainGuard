# ============================================================
# ChainGuard — Risk Engine
# Composite risk scoring combining weather, news, and ML models.
# ============================================================
import random
from datetime import datetime, timezone

from models.model_trainer import disruption_model, eta_predictor
from services.weather_service import WeatherService
from services.news_service import NewsService


weather_service = WeatherService()
news_service = NewsService()

# Indian festival windows (month, day_start, day_end)
FESTIVAL_WINDOWS = [
    (1, 20, 31),   # Republic Day window
    (3, 1, 30),    # Holi window
    (8, 10, 20),   # Independence Day window
    (10, 1, 15),   # Navratri window
    (10, 20, 31),  # Diwali early window
    (11, 1, 15),   # Diwali late window
]


def is_festival_period(dt: datetime = None) -> bool:
    """Check if a date falls within an Indian festival window."""
    if dt is None:
        dt = datetime.now()
    m, d = dt.month, dt.day
    for fm, ds, de in FESTIVAL_WINDOWS:
        if m == fm and ds <= d <= de:
            return True
    return False


def _risk_label(score: int) -> str:
    if score <= 30:
        return "Low"
    if score <= 60:
        return "Medium"
    if score <= 80:
        return "High"
    return "Critical"


def _recommendation(score: int) -> str:
    if score <= 30:
        return "Route is safe. Proceed as planned."
    if score <= 60:
        return "Moderate risk detected. Monitor weather updates and consider buffer time."
    if score <= 80:
        return "High risk. Consider rerouting or delaying shipment. Enable live tracking."
    return "Critical disruption risk! Immediate rerouting recommended. Alert all stakeholders."


class RiskEngine:

    async def calculate_route_risk(self, origin: str, destination: str) -> dict:
        """Calculate composite risk score for a route."""
        now = datetime.now(timezone.utc)

        # 1. Fetch weather concurrently
        import asyncio
        origin_wx, dest_wx = await asyncio.gather(
            weather_service.fetch_city_weather(origin),
            weather_service.fetch_city_weather(destination),
        )

        # 2. Get news risk
        news_summary = await news_service.get_risk_summary()
        news_risk = news_summary.get("overall_news_risk_score", 0)

        # 3. Build ML features
        wx_max = max(origin_wx["weather_score"], dest_wx["weather_score"])
        traffic_score = round(random.uniform(2, 7), 1)  # simulated
        festival = is_festival_period()

        ml_features = {
            "weather_score": wx_max,
            "traffic_score": traffic_score,
            "news_risk_score": news_risk / 10.0,
            "day_of_week": now.weekday() + 1,
            "is_festival_period": 1 if festival else 0,
            "route_historical_disruption_rate": 0.15,
            "time_of_day": now.hour,
            "checkpost_count": 1,
        }
        ml_pred = disruption_model.predict(ml_features)

        # 4. Composite risk
        wx_avg = (origin_wx["weather_score"] + dest_wx["weather_score"]) / 2.0
        composite = wx_avg * 3.0 + news_risk * 2.0 + ml_pred["disruption_score"] * 0.5
        composite = min(int(composite), 100)

        # 5. ETA prediction
        eta_features = {
            "planned_distance_km": 400,
            "disruption_risk_score": composite,
            "weather_score": wx_max,
            "vehicle_type": "truck",
            "weight_kg": 500,
            "time_of_day": now.hour,
            "is_weekend": 1 if now.weekday() >= 5 else 0,
            "active_disruptions_on_route": len(news_summary.get("high_risk_articles", [])),
        }
        eta_pred = eta_predictor.predict(eta_features)

        # 6. Disruption factors
        factors = []
        if origin_wx["weather_score"] >= 4:
            factors.append(f"Adverse weather at {origin} ({origin_wx['weather_main']})")
        if dest_wx["weather_score"] >= 4:
            factors.append(f"Adverse weather at {destination} ({dest_wx['weather_main']})")
        if news_risk > 30:
            factors.append(f"High news disruption signal (score: {news_risk})")
        if traffic_score >= 5:
            factors.append(f"Elevated traffic congestion (score: {traffic_score})")
        if festival:
            factors.append("Festival period — expect volume surges and restrictions")
        if not factors:
            factors.append("No significant disruption factors detected")

        return {
            "origin": origin,
            "destination": destination,
            "composite_risk_score": composite,
            "risk_label": _risk_label(composite),
            "origin_weather": origin_wx,
            "destination_weather": dest_wx,
            "news_risk_score": news_risk,
            "ml_prediction": ml_pred,
            "eta_prediction": eta_pred,
            "disruption_factors": factors,
            "recommendation": _recommendation(composite),
            "calculated_at": now.isoformat(),
        }

    async def calculate_city_risk(self, city_name: str) -> dict:
        """Calculate risk score for a single city."""
        wx = await weather_service.fetch_city_weather(city_name)
        news_summary = await news_service.get_risk_summary()

        news_risk = news_summary.get("overall_news_risk_score", 0)
        composite = min(int(wx["weather_score"] * 5 + news_risk * 2), 100)

        return {
            "city": city_name,
            "risk_score": composite,
            "risk_label": _risk_label(composite),
            "weather": wx,
            "news_risk_score": news_risk,
            "recommendation": _recommendation(composite),
            "calculated_at": datetime.now(timezone.utc).isoformat(),
        }
