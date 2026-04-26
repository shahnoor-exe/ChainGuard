# ============================================================
# ChainGuard — Disruption Risk Model (Random Forest)
# Predicts disruption probability and risk score from 8 features.
# ============================================================
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error


class DisruptionRiskModel:
    """Random Forest-based disruption risk predictor."""

    FEATURE_NAMES = [
        "weather_score",
        "traffic_score",
        "news_risk_score",
        "day_of_week",
        "is_festival_period",
        "route_historical_disruption_rate",
        "time_of_day",
        "checkpost_count",
    ]

    def __init__(self):
        self.classifier = RandomForestClassifier(
            n_estimators=100, max_depth=8, random_state=42, n_jobs=-1
        )
        self.regressor = RandomForestRegressor(
            n_estimators=100, max_depth=8, random_state=42, n_jobs=-1
        )
        self._trained = False

    # ── Synthetic data generator ─────────────────────────────
    def _generate_training_data(self, n_samples: int = 2000):
        rng = np.random.RandomState(42)

        weather_score = rng.uniform(0, 10, n_samples)
        traffic_score = rng.uniform(0, 10, n_samples)
        news_risk_score = rng.uniform(0, 10, n_samples)
        day_of_week = rng.randint(1, 8, n_samples)
        is_festival_period = rng.choice([0, 1], n_samples, p=[0.85, 0.15])
        route_hist = rng.uniform(0, 1, n_samples)
        time_of_day = rng.randint(0, 24, n_samples)
        checkpost_count = rng.randint(0, 6, n_samples)

        X = np.column_stack([
            weather_score, traffic_score, news_risk_score, day_of_week,
            is_festival_period, route_hist, time_of_day, checkpost_count,
        ])

        # Label generation
        base_risk = (
            weather_score * 0.30
            + traffic_score * 0.25
            + news_risk_score * 0.25
            + route_hist * 10 * 0.20
        )
        base_risk = base_risk + is_festival_period * 1.5
        rush_hour = np.where(
            ((time_of_day >= 6) & (time_of_day <= 9))
            | ((time_of_day >= 17) & (time_of_day <= 20)),
            0.8, 0.0,
        )
        base_risk = base_risk + rush_hour

        disruption_prob = np.clip(base_risk / 10.0, 0, 1) + rng.normal(0, 0.05, n_samples)
        disruption_prob = np.clip(disruption_prob, 0, 1)

        y_class = (disruption_prob >= 0.3).astype(int)
        y_score = np.clip(base_risk * 10, 0, 100)

        return X, y_class, y_score

    # ── Training ─────────────────────────────────────────────
    def train(self):
        print("[TRAIN] Training DisruptionRiskModel...")
        X, y_class, y_score = self._generate_training_data()

        X_train, X_test, yc_train, yc_test, ys_train, ys_test = train_test_split(
            X, y_class, y_score, test_size=0.2, random_state=42
        )

        # Train classifier
        self.classifier.fit(X_train, yc_train)
        yc_pred = self.classifier.predict(X_test)
        acc = accuracy_score(yc_test, yc_pred)
        print(f"   Classifier accuracy: {acc:.3f}")

        # Train regressor
        self.regressor.fit(X_train, ys_train)
        ys_pred = self.regressor.predict(X_test)
        mae = mean_absolute_error(ys_test, ys_pred)
        print(f"   Regressor MAE: {mae:.2f}")

        self._trained = True
        print("[OK] DisruptionRiskModel trained")

    # ── Prediction ───────────────────────────────────────────
    def predict(self, features: dict) -> dict:
        if not self._trained:
            raise RuntimeError("Model not trained — call train() first")

        x = np.array([[
            features.get("weather_score", 2.0),
            features.get("traffic_score", 3.0),
            features.get("news_risk_score", 2.0),
            features.get("day_of_week", 3),
            features.get("is_festival_period", 0),
            features.get("route_historical_disruption_rate", 0.15),
            features.get("time_of_day", 12),
            features.get("checkpost_count", 1),
        ]])

        prob = float(self.classifier.predict_proba(x)[0][1])
        score = int(np.clip(self.regressor.predict(x)[0], 0, 100))

        # Risk category
        if score <= 30:
            category = "Low"
        elif score <= 60:
            category = "Medium"
        elif score <= 80:
            category = "High"
        else:
            category = "Critical"

        # Top factors from feature importance
        importances = dict(zip(self.FEATURE_NAMES, self.regressor.feature_importances_))
        top_factors = sorted(importances, key=importances.get, reverse=True)[:3]

        return {
            "disruption_probability": round(prob, 3),
            "disruption_score": score,
            "risk_category": category,
            "top_factors": top_factors,
        }

    # ── Feature importance ───────────────────────────────────
    def get_feature_importance(self) -> dict:
        if not self._trained:
            return {}
        return {
            name: round(float(imp), 4)
            for name, imp in zip(self.FEATURE_NAMES, self.regressor.feature_importances_)
        }
