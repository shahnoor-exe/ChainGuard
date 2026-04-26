# ============================================================
# ChainGuard — Predict Router
# ML prediction endpoints for disruption risk and ETA.
# ============================================================
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

from models.model_trainer import disruption_model, eta_predictor
from services.risk_engine import RiskEngine

router = APIRouter(prefix="/predict", tags=["Predictions"])
risk_engine = RiskEngine()


class DisruptionInput(BaseModel):
    weather_score: float = Field(2.0, ge=0, le=10)
    traffic_score: float = Field(3.0, ge=0, le=10)
    news_risk_score: float = Field(2.0, ge=0, le=10)
    day_of_week: int = Field(3, ge=1, le=7)
    is_festival_period: int = Field(0, ge=0, le=1)
    route_historical_disruption_rate: float = Field(0.15, ge=0, le=1)
    time_of_day: int = Field(12, ge=0, le=23)
    checkpost_count: int = Field(1, ge=0, le=5)


class ETAInput(BaseModel):
    planned_distance_km: float = Field(400, ge=10)
    disruption_risk_score: float = Field(30, ge=0, le=100)
    weather_score: float = Field(2.0, ge=0, le=10)
    vehicle_type: str = Field("truck")
    weight_kg: float = Field(500, ge=1)
    time_of_day: int = Field(12, ge=0, le=23)
    is_weekend: int = Field(0, ge=0, le=1)
    active_disruptions_on_route: int = Field(0, ge=0, le=5)


@router.post("/disruption")
async def predict_disruption(body: DisruptionInput):
    """Predict disruption probability and risk score."""
    try:
        result = disruption_model.predict(body.model_dump())
        return {"success": True, "data": result, "message": "Disruption prediction complete"}
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}


@router.post("/eta")
async def predict_eta(body: ETAInput):
    """Predict delivery delay and adjusted ETA offset."""
    try:
        result = eta_predictor.predict(body.model_dump())
        return {"success": True, "data": result, "message": "ETA prediction complete"}
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}


@router.get("/route-risk/{origin}/{destination}")
async def predict_route_risk(origin: str, destination: str):
    """Full composite risk assessment for a route."""
    try:
        result = await risk_engine.calculate_route_risk(origin, destination)
        return {"success": True, "data": result, "message": "Route risk calculated"}
    except Exception as e:
        return {"success": False, "data": None, "message": str(e)}


@router.get("/model-info")
async def model_info():
    """Return feature importance from the disruption model."""
    return {
        "success": True,
        "data": {
            "disruption_model_features": disruption_model.get_feature_importance(),
            "eta_model_features": eta_predictor.FEATURE_NAMES,
        },
        "message": "Model info retrieved",
    }
