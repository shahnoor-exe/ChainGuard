# ============================================================
# ChainGuard — Model Trainer
# Initialises and trains both ML models at import time.
# ============================================================
from models.disruption_model import DisruptionRiskModel
from models.eta_model import ETAPredictor

print("=" * 53)
print("  ChainGuard ML - Training models...")
print("=" * 53)

disruption_model = DisruptionRiskModel()
disruption_model.train()

eta_predictor = ETAPredictor()
eta_predictor.train()

print("=" * 53)
print("  ML Models trained and ready")
print("=" * 53)
