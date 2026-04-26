from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

app = FastAPI(title="ChainGuard ML Engine", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://chain-guard-olive.vercel.app",
        "https://chainguard.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
)

# ── LAZY MODEL REGISTRY ───────────────────────────────────────────────────────
# Models are NOT loaded at startup — only when first called
# This keeps startup RAM under 150MB instead of 600MB+
_models = {}

def get_models():
    """Load ML models only once, on first prediction request."""
    if "loaded" not in _models:
        print("[ML] Loading models on first request...")
        from services.risk_engine import build_risk_model
        from services.eta_model import build_eta_model
        _models["risk"] = build_risk_model()
        _models["eta"] = build_eta_model()
        _models["loaded"] = True
        print("[ML] Models ready ✅")
    return _models


# ── HEALTH / PING ENDPOINTS ───────────────────────────────────────────────────

@app.get("/")
@app.head("/")
async def root():
    """Root — supports HEAD for UptimeRobot."""
    return {
        "service": "ChainGuard ML Engine",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/ping")
@app.head("/ping")
async def ping():
    """Ultra-lightweight ping — NO model access, instant response.
       Use THIS URL in UptimeRobot, not /health."""
    return {"pong": True}

@app.get("/health")
@app.head("/health")
async def health():
    """Health check — lightweight, no model loading."""
    return {
        "status": "ok",
        "service": "ChainGuard ML Engine",
        "timestamp": datetime.now().isoformat(),
        "memory_note": "Models load lazily on first prediction request"
    }


# ── PREDICTION ENDPOINTS ──────────────────────────────────────────────────────

@app.post("/predict/route-risk/{origin}/{destination}")
async def predict_route_risk(origin: str, destination: str):
    """Predict risk score for a route. Loads models on first call."""
    try:
        models = get_models()  # lazy load here, not at startup
        risk_score = models["risk"].predict(origin, destination)
        eta_info = models["eta"].predict(origin, destination)
        return {
            "origin": origin,
            "destination": destination,
            "risk_score": round(risk_score, 1),
            "eta_hours": eta_info.get("hours"),
            "confidence": eta_info.get("confidence", 0.85),
            "timestamp": datetime.now().isoformat(),
            "is_mock": False
        }
    except Exception as e:
        print(f"[ML] Prediction error: {e}")
        # Fallback mock data so frontend never crashes
        return _mock_route_risk(origin, destination)


@app.get("/weather/{city}")
async def get_weather(city: str):
    """Fetch weather for a city via OpenWeatherMap."""
    try:
        from services.weather_service import fetch_weather
        return await fetch_weather(city)
    except Exception as e:
        print(f"[Weather] Error for {city}: {e}")
        return _mock_weather(city)


@app.get("/news/risk-summary")
async def news_risk_summary():
    """Analyze recent news for supply chain risk signals."""
    try:
        from services.news_service import get_risk_summary
        return await get_risk_summary()
    except Exception as e:
        print(f"[News] Error: {e}")
        return _mock_news_summary()


@app.get("/risk/india/heatmap")
async def india_heatmap():
    """Return risk scores for major Indian cities."""
    try:
        from services.risk_engine import get_city_risk_scores
        return get_city_risk_scores()
    except Exception as e:
        print(f"[Heatmap] Error: {e}")
        return _mock_heatmap()


# ── MOCK FALLBACKS ────────────────────────────────────────────────────────────
# These ensure the frontend ALWAYS gets a valid response
# even during cold starts or model loading failures

def _mock_route_risk(origin: str, destination: str):
    import random
    return {
        "origin": origin, "destination": destination,
        "risk_score": round(random.uniform(25, 75), 1),
        "eta_hours": round(random.uniform(8, 36), 1),
        "confidence": 0.78,
        "timestamp": datetime.now().isoformat(),
        "is_mock": True
    }

def _mock_weather(city: str):
    return {
        "city": city, "temperature": 28, "feels_like": 30,
        "description": "partly cloudy", "humidity": 65,
        "wind_speed": 12, "weather_score": 3,
        "is_mock": True
    }

def _mock_news_summary():
    return {
        "risk_events": [
            {"title": "Port congestion at JNPT Mumbai", "severity": "medium", "score": 55},
            {"title": "NH-44 repairs cause delays near Nagpur", "severity": "low", "score": 30}
        ],
        "overall_news_risk": 42,
        "is_mock": True
    }

def _mock_heatmap():
    cities = [
        ("Mumbai", 45), ("Delhi", 38), ("Bangalore", 22), ("Chennai", 31),
        ("Kolkata", 52), ("Hyderabad", 28), ("Pune", 19), ("Ahmedabad", 44),
        ("Nagpur", 67), ("Surat", 25), ("Jaipur", 41), ("Lucknow", 35),
        ("Chandigarh", 29), ("Bhopal", 48), ("Kochi", 33)
    ]
    return [{"city": c, "risk_score": s, "lat": 0, "lng": 0} for c, s in cities]
