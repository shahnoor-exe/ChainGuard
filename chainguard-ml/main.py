# ============================================================
# ChainGuard — ML Intelligence Engine (FastAPI)
# Main entry point — port 8000
# ============================================================
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import predict, weather, news, risk


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle — trains ML models on boot."""
    # Models are trained at import time via model_trainer.py
    from models.model_trainer import disruption_model, eta_predictor  # noqa: F401
    print("[OK] ChainGuard ML Engine ready")
    yield
    print("[EXIT] ChainGuard ML Engine shutting down")


app = FastAPI(
    title="ChainGuard ML Engine",
    description="Supply chain disruption prediction & intelligence API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Routers ────────────────────────────────────────────
app.include_router(predict.router)
app.include_router(weather.router)
app.include_router(news.router)
app.include_router(risk.router)


# ── Health Check ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "ChainGuard ML Engine",
        "status": "operational",
        "models": ["disruption_rf", "eta_xgb"],
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
