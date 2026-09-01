"""
FinTwin Machine Learning Training Pipeline.
Trains, benchmarks, and exports multi-model ensemble pipelines on 88,000+ real-world invoice records.
Outputs:
  - models/payment_delay_pipeline.joblib
  - models/payment_delay_model.joblib (backward compatible)
  - models/model_metrics.json
"""

import os
import json
import time
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    f1_score,
)
from sklearn.ensemble import RandomForestRegressor
import lightgbm as lgb
import xgboost as xgb


FEATURE_COLUMNS = [
    "invoice_amount",
    "days_until_due",
    "previous_avg_delay",
    "previous_late_payments",
    "customer_invoice_count",
    "customer_tenure_months",
    "is_disputed",
    "late_ratio",
    "amount_tier",
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Compute derived interaction and risk ratio features."""
    data = df.copy()
    data["customer_invoice_count"] = data["customer_invoice_count"].clip(lower=1)
    data["late_ratio"] = (data["previous_late_payments"] / data["customer_invoice_count"]).clip(0, 1)

    # Categorize invoice amount tiers (1: Micro, 2: Small, 3: Medium, 4: Large Enterprise)
    data["amount_tier"] = pd.cut(
        data["invoice_amount"],
        bins=[-np.inf, 50000, 200000, 1000000, np.inf],
        labels=[1, 2, 3, 4],
    ).astype(float)

    return data


def train_and_evaluate(data_path: str = None, model_dir: str = None):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if data_path is None:
        data_path = os.path.abspath(os.path.join(current_dir, "..", "..", "data", "unified_payment_history.csv"))
    if model_dir is None:
        model_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "models"))

    os.makedirs(model_dir, exist_ok=True)

    print(f"[*] Loading training data from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"[+] Loaded {len(df):,} total financial transaction records.")

    # Engineer features
    df = engineer_features(df)

    X = df[FEATURE_COLUMNS]
    y_reg = df["delay_days"]
    y_clf = df["risk_category"]

    X_train, X_test, y_train_reg, y_test_reg, y_train_clf, y_test_clf = train_test_split(
        X, y_reg, y_clf, test_size=0.2, random_state=42
    )

    print(f"[+] Split dataset into {len(X_train):,} training records and {len(X_test):,} validation records.")

    # =========================================================================
    # 1. Benchmark & Train Regressors (Payment Delay Days)
    # =========================================================================
    print("\n" + "=" * 50)
    print("BENCHMARKING REGRESSION ALGORITHMS")
    print("=" * 50)

    regressors = {
        "LightGBM": lgb.LGBMRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=8,
            num_leaves=31,
            random_state=42,
            verbose=-1,
        ),
        "XGBoost": xgb.XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            random_state=42,
            verbosity=0,
        ),
        "RandomForest": RandomForestRegressor(
            n_estimators=150,
            max_depth=12,
            random_state=42,
            n_jobs=-1,
        ),
    }

    benchmark_results = {}
    best_reg_name = None
    best_reg_model = None
    best_reg_mae = float("inf")

    for name, model in regressors.items():
        t0 = time.time()
        print(f"[*] Training {name} Regressor...")
        model.fit(X_train, y_train_reg)
        elapsed = time.time() - t0

        preds = model.predict(X_test)
        mae = mean_absolute_error(y_test_reg, preds)
        mse = mean_squared_error(y_test_reg, preds)
        rmse = float(np.sqrt(mse))
        r2 = r2_score(y_test_reg, preds)

        print(f"    -> {name} | MAE: {mae:.3f} days | RMSE: {rmse:.3f} days | R²: {r2:.4f} | Time: {elapsed:.2f}s")
        benchmark_results[name] = {
            "mae": round(float(mae), 4),
            "rmse": round(float(rmse), 4),
            "r2": round(float(r2), 4),
            "training_time_sec": round(elapsed, 2),
        }

        if mae < best_reg_mae:
            best_reg_mae = mae
            best_reg_name = name
            best_reg_model = model

    print(f"\n[BEST MODEL] Selected: {best_reg_name} (MAE: {best_reg_mae:.3f} days)")

    # =========================================================================
    # 2. Train Risk Classification Model (LOW, MEDIUM, HIGH, CRITICAL)
    # =========================================================================
    print("\n" + "=" * 50)
    print("TRAINING RISK TIER & DISPUTE CLASSIFIER")
    print("=" * 50)

    clf_model = lgb.LGBMClassifier(
        n_estimators=250,
        learning_rate=0.05,
        max_depth=7,
        num_leaves=31,
        random_state=42,
        verbose=-1,
    )
    clf_model.fit(X_train, y_train_clf)
    clf_preds = clf_model.predict(X_test)
    clf_accuracy = accuracy_score(y_test_clf, clf_preds)
    clf_f1 = f1_score(y_test_clf, clf_preds, average="weighted")
    print(f"Risk Classifier Accuracy: {clf_accuracy * 100:.2f}% | F1 Score: {clf_f1:.4f}")

    # =========================================================================
    # 3. Extract Feature Importance
    # =========================================================================
    if hasattr(best_reg_model, "feature_importances_"):
        raw_importances = best_reg_model.feature_importances_
    else:
        raw_importances = np.ones(len(FEATURE_COLUMNS))

    total_imp = sum(raw_importances) or 1.0
    feature_importances = {
        col: round(float(imp / total_imp), 4) for col, imp in zip(FEATURE_COLUMNS, raw_importances)
    }
    # Sort descending
    feature_importances = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

    print("\nFeature Importances:")
    for feat, imp in feature_importances.items():
        print(f"  - {feat:25s}: {imp * 100:.2f}%")

    # =========================================================================
    # 4. Export Artifacts
    # =========================================================================
    now_iso = datetime.now(timezone.utc).isoformat()
    pipeline_bundle = {
        "version": "2.0.0",
        "created_at": now_iso,
        "regressor_name": best_reg_name,
        "regressor_model": best_reg_model,
        "classifier_model": clf_model,
        "feature_columns": FEATURE_COLUMNS,
        "metrics": {
            "regressor_mae": benchmark_results[best_reg_name]["mae"],
            "regressor_rmse": benchmark_results[best_reg_name]["rmse"],
            "regressor_r2": benchmark_results[best_reg_name]["r2"],
            "classifier_accuracy": round(float(clf_accuracy), 4),
            "classifier_f1": round(float(clf_f1), 4),
            "dataset_total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
        },
        "feature_importances": feature_importances,
    }

    pipeline_path = os.path.join(model_dir, "payment_delay_pipeline.joblib")
    legacy_model_path = os.path.join(model_dir, "payment_delay_model.joblib")
    metrics_path = os.path.join(model_dir, "model_metrics.json")

    joblib.dump(pipeline_bundle, pipeline_path)
    joblib.dump(best_reg_model, legacy_model_path)

    metrics_payload = {
        "pipeline_version": "2.0.0",
        "training_timestamp": now_iso,
        "total_records_trained": len(df),
        "selected_model": best_reg_name,
        "benchmarks": benchmark_results,
        "feature_importances": feature_importances,
        "classifier_metrics": {
            "accuracy": round(float(clf_accuracy), 4),
            "f1_score": round(float(clf_f1), 4),
            "classes": [str(c) for c in clf_model.classes_],
        },
    }

    with open(metrics_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print("\n" + "=" * 50)
    print("[SUCCESS] ML TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print(f"[+] Pipeline Artifact saved to : {pipeline_path}")
    print(f"[+] Legacy Weights saved to    : {legacy_model_path}")
    print(f"[+] Model Metrics saved to     : {metrics_path}")

    return pipeline_bundle


if __name__ == "__main__":
    train_and_evaluate()
