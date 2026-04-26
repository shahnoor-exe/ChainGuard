# ============================================================
# ChainGuard — ETA Predictor Model (XGBoost Regression)
# Predicts delivery delay in hours from 8 features.
# ============================================================
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error


class ETAPredictor:
    """XGBoost-based ETA delay predictor."""

    FEATURE_NAMES = [
        "planned_distance_km",
        "disruption_risk_score",
        "weather_score",
        "vehicle_type_encoded",
        "weight_kg",
        "time_of_day",
        "is_weekend",
        "active_disruptions_on_route",
    ]

    VEHICLE_ENCODING = {"bike": 0, "van": 1, "truck": 2, "heavy_truck": 3}

    def __init__(self):
        self.model = XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        )
        self._trained = False

    # ── Synthetic data generator ─────────────────────────────
    def _generate_training_data(self, n_samples: int = 2000):
        rng = np.random.RandomState(42)

        planned_distance_km = rng.uniform(50, 1200, n_samples)
        disruption_risk_score = rng.uniform(0, 100, n_samples)
        weather_score = rng.uniform(0, 10, n_samples)
        vehicle_type_encoded = rng.randint(0, 4, n_samples)
        weight_kg = rng.uniform(10, 5000, n_samples)
        time_of_day = rng.randint(0, 24, n_samples)
        is_weekend = rng.choice([0, 1], n_samples, p=[0.71, 0.29])
        active_disruptions = rng.randint(0, 6, n_samples)

        X = np.column_stack([
            planned_distance_km, disruption_risk_score, weather_score,
            vehicle_type_encoded, weight_kg, time_of_day,
            is_weekend, active_disruptions,
        ])

        # Label: delay_hours
        base_delay = disruption_risk_score * 0.08 + weather_score * 0.4
        base_delay = np.where(vehicle_type_encoded == 3, base_delay + 0.5, base_delay)
        base_delay = np.where(active_disruptions > 2, base_delay + 1.2, base_delay)
        noise = rng.normal(0, 0.3, n_samples)
        y = np.maximum(0, base_delay + noise)

        return X, y

    # ── Training ─────────────────────────────────────────────
    def train(self):
        print("[TRAIN] Training ETAPredictor...")
        X, y = self._generate_training_data()

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        print(f"   RMSE: {rmse:.3f} hours")

        self._trained = True
        print("[OK] ETAPredictor trained")

    # ── Prediction ───────────────────────────────────────────
    def predict(self, features: dict) -> dict:
        if not self._trained:
            raise RuntimeError("Model not trained — call train() first")

        # Encode vehicle type
        vt = features.get("vehicle_type", "truck")
        if isinstance(vt, str):
            vt_encoded = self.VEHICLE_ENCODING.get(vt.lower(), 2)
        else:
            vt_encoded = int(vt)

        x = np.array([[
            features.get("planned_distance_km", 400),
            features.get("disruption_risk_score", 30),
            features.get("weather_score", 2.0),
            vt_encoded,
            features.get("weight_kg", 500),
            features.get("time_of_day", 12),
            features.get("is_weekend", 0),
            features.get("active_disruptions_on_route", 0),
        ]])

        delay_hours = max(0.0, float(self.model.predict(x)[0]))

        # Confidence: inversely proportional to risk
        risk = features.get("disruption_risk_score", 30)
        confidence = round(max(0.6, min(0.95, 0.95 - risk * 0.004)), 2)

        return {
            "delay_hours": round(delay_hours, 2),
            "confidence": confidence,
            "predicted_eta_offset_minutes": int(delay_hours * 60),
        }
