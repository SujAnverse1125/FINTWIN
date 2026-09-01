"""
FinTwin Model Training Entrypoint.
Delegates to train_pipeline.py to train and benchmark models on the unified dataset (88,305 records).
Works from any working directory.
"""

import os
import sys

# Add backend directory to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.ml.train_pipeline import train_and_evaluate


if __name__ == "__main__":
    train_and_evaluate()