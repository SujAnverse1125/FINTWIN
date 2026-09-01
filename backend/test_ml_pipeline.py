import os
import sys
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from fastapi.testclient import TestClient
from app.main import app
from app.ml.predict import (
    predict_payment_delay,
    predict_batch_payment_delays,
    get_model_telemetry,
)


def test_artifacts_exist():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    pipeline_path = os.path.join(current_dir, "models", "payment_delay_pipeline.joblib")
    metrics_path = os.path.join(current_dir, "models", "model_metrics.json")
    data_path = os.path.join(current_dir, "data", "unified_payment_history.csv")

    assert os.path.exists(pipeline_path), f"Missing pipeline artifact at {pipeline_path}"
    assert os.path.exists(metrics_path), f"Missing metrics JSON at {metrics_path}"
    assert os.path.exists(data_path), f"Missing training dataset at {data_path}"

    with open(metrics_path, "r") as f:
        metrics = json.load(f)

    assert metrics["total_records_trained"] >= 80000
    assert "RandomForest" in metrics["benchmarks"]
    assert "feature_importances" in metrics
    print("[PASS] Artifact verification passed.")


def test_single_prediction():
    res = predict_payment_delay(
        invoice_amount=500000.0,
        days_until_due=30,
        previous_avg_delay=12.0,
        previous_late_payments=2,
        customer_invoice_count=10,
        customer_tenure_months=24.0,
        is_disputed=0,
        due_date="2026-10-15",
    )

    assert "predicted_delay_days" in res
    assert "risk" in res
    assert res["risk"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert "confidence_score" in res
    assert res["expected_settlement_date"] is not None
    print(f"[PASS] Single prediction passed: delay={res['predicted_delay_days']}d, risk={res['risk']}")


def test_batch_prediction():
    invoices = [
        {"id": "INV-1", "amount": 100000, "dueDate": "2026-11-01", "previousAvgDelay": 1.0},
        {"id": "INV-2", "amount": 900000, "dueDate": "2026-11-10", "previousAvgDelay": 28.0, "previousLatePayments": 6},
    ]
    batch_res = predict_batch_payment_delays(invoices)
    assert len(batch_res) == 2
    assert batch_res[0]["predicted_delay_days"] < batch_res[1]["predicted_delay_days"]
    print(f"[PASS] Batch prediction passed ({len(batch_res)} records).")


def test_fastapi_endpoints():
    client = TestClient(app)

    # 1. Model Info
    r1 = client.get("/api/ml/model-info")
    assert r1.status_code == 200
    assert r1.json()["success"] is True
    assert r1.json()["model"]["total_records_trained"] >= 80000

    # 2. Single Prediction
    r2 = client.post(
        "/api/ml/predict-payment-delay",
        json={
            "invoice_amount": 350000.0,
            "days_until_due": 30,
            "previous_avg_delay": 5.0,
            "previous_late_payments": 1,
            "customer_invoice_count": 8,
            "due_date": "2026-12-01",
        },
    )
    assert r2.status_code == 200
    assert r2.json()["success"] is True

    # 3. Batch Prediction
    r3 = client.post(
        "/api/ml/predict-batch",
        json={
            "invoices": [
                {"id": "A", "amount": 200000, "dueDate": "2026-10-01"},
                {"id": "B", "amount": 800000, "dueDate": "2026-10-05"},
            ]
        },
    )
    assert r3.status_code == 200
    assert r3.json()["count"] == 2
    print("[PASS] FastAPI ML Endpoints passed.")


if __name__ == "__main__":
    test_artifacts_exist()
    test_single_prediction()
    test_batch_prediction()
    test_fastapi_endpoints()
    print("\n[ALL TESTS PASSED SUCCESSFULLY!]")
