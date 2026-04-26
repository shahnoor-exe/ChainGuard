# ============================================================
# ChainGuard — Weather Service (OpenWeatherMap)
# Fetches live weather and computes logistics severity scores.
# ============================================================
import os
import httpx
from datetime import datetime


OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"


def _calculate_weather_score(data: dict) -> float:
    """Compute a 0–10 logistics severity score from OWM response."""
    weather_main = data.get("weather", [{}])[0].get("main", "Clear")
    wind_speed = data.get("wind", {}).get("speed", 0)
    visibility = data.get("visibility", 10000)
    rain_1h = data.get("rain", {}).get("1h", 0)

    base = 1.0
    if weather_main in ("Thunderstorm",):
        base = 8.0
    elif weather_main in ("Snow", "Blizzard"):
        base = 7.0
    elif weather_main in ("Rain", "Drizzle"):
        base = 4.0 + min(rain_1h * 0.5, 3.0)
    elif weather_main in ("Fog", "Mist", "Haze"):
        base = 3.0
    elif weather_main in ("Dust", "Sand", "Smoke"):
        base = 5.0

    if wind_speed > 20:
        base += 2.0
    elif wind_speed > 12:
        base += 1.0
    if visibility < 1000:
        base += 2.0
    elif visibility < 3000:
        base += 1.0

    return min(round(base, 1), 10.0)


def _get_alert_level(score: float) -> str:
    if score >= 7:
        return "severe"
    if score >= 5:
        return "warning"
    if score >= 3:
        return "watch"
    return "none"


def _mock_weather(city_name: str) -> dict:
    """Fallback mock data when API is unavailable."""
    return {
        "city": city_name,
        "temperature_c": 32.0,
        "feels_like_c": 35.0,
        "humidity_pct": 60,
        "weather_main": "Clear",
        "weather_description": "clear sky",
        "wind_speed_ms": 3.5,
        "visibility_m": 10000,
        "weather_score": 2.0,
        "alert_level": "none",
        "is_mock": True,
        "raw_data": {},
    }


class WeatherService:

    async def fetch_city_weather(self, city_name: str) -> dict:
        """Fetch current weather for an Indian city."""
        if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY.startswith("your_"):
            return _mock_weather(city_name)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    BASE_URL,
                    params={
                        "q": f"{city_name},IN",
                        "appid": OPENWEATHER_API_KEY,
                        "units": "metric",
                    },
                )
                if resp.status_code != 200:
                    print(f"[WARN] OWM returned {resp.status_code} for {city_name}")
                    return _mock_weather(city_name)

                data = resp.json()

            weather_score = _calculate_weather_score(data)
            main_weather = data.get("weather", [{}])[0]

            return {
                "city": city_name,
                "temperature_c": data.get("main", {}).get("temp", 0),
                "feels_like_c": data.get("main", {}).get("feels_like", 0),
                "humidity_pct": data.get("main", {}).get("humidity", 0),
                "weather_main": main_weather.get("main", "Clear"),
                "weather_description": main_weather.get("description", ""),
                "wind_speed_ms": data.get("wind", {}).get("speed", 0),
                "visibility_m": data.get("visibility", 10000),
                "weather_score": weather_score,
                "alert_level": _get_alert_level(weather_score),
                "is_mock": False,
                "raw_data": data,
            }
        except Exception as e:
            print(f"[WARN] Weather fetch failed for {city_name}: {e}")
            return _mock_weather(city_name)

    async def fetch_multiple_cities(self, city_names: list) -> list:
        """Fetch weather for multiple cities concurrently."""
        import asyncio
        tasks = [self.fetch_city_weather(c.strip()) for c in city_names]
        return await asyncio.gather(*tasks)
