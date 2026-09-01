"""
Data Preparation & Feature Engineering Pipeline for FinTwin ML Model.
Consolidates and processes real-world B2B and Accounts Receivable datasets into
a unified, high-performance training dataset.
"""

import os
import pandas as pd
import numpy as np


def prepare_unified_dataset(base_dir: str = None) -> pd.DataFrame:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if base_dir is None:
        # Search parent directories for 'Dataset'
        candidate = current_dir
        for _ in range(5):
            if os.path.exists(os.path.join(candidate, "Dataset")):
                base_dir = candidate
                break
            candidate = os.path.dirname(candidate)
        if base_dir is None:
            base_dir = "d:/FRontend fix"

    ds1_path = os.path.join(base_dir, "Dataset", "archive (1)", "dataset.csv")
    ds2_path = os.path.join(base_dir, "Dataset", "archive (2)", "WA_Fn-UseC_-Accounts-Receivable.csv")
    ds3_path = os.path.join(base_dir, "Dataset", "archive (3)", "Dataset.csv")
    output_dir = os.path.join(current_dir, "..", "..", "data")
    output_path = os.path.join(output_dir, "unified_payment_history.csv")

    os.makedirs(output_dir, exist_ok=True)
    frames = []

    # =========================================================================
    # 1. Dataset 1: HighRadius / Kaggle B2B Invoice Lifecycle Dataset (50,000 records)
    # =========================================================================
    if os.path.exists(ds1_path):
        print(f"[*] Processing Dataset 1 from {ds1_path}...")
        df1 = pd.read_csv(ds1_path)
        # Filter for settled invoices
        df1_settled = df1[df1["isOpen"] == 0].dropna(
            subset=["clear_date", "due_in_date", "total_open_amount", "baseline_create_date"]
        ).copy()

        df1_settled["clear_date"] = pd.to_datetime(df1_settled["clear_date"])
        df1_settled["due_in_date"] = pd.to_datetime(df1_settled["due_in_date"], format="%Y%m%d", errors="coerce")
        df1_settled["baseline_create_date"] = pd.to_datetime(
            df1_settled["baseline_create_date"], format="%Y%m%d", errors="coerce"
        )

        df1_settled = df1_settled.dropna(subset=["due_in_date", "baseline_create_date"])
        df1_settled["delay_days"] = (df1_settled["clear_date"] - df1_settled["due_in_date"]).dt.days
        df1_settled["days_until_due"] = (
            (df1_settled["due_in_date"] - df1_settled["baseline_create_date"]).dt.days.clip(1, 180).fillna(30)
        )
        df1_settled["is_late"] = (df1_settled["delay_days"] > 0).astype(int)

        # Customer-level historical aggregates
        cust_stats1 = df1_settled.groupby("cust_number").agg(
            previous_avg_delay=("delay_days", "mean"),
            previous_late_payments=("is_late", "sum"),
            customer_invoice_count=("doc_id", "count"),
        ).reset_index()

        df1_clean = df1_settled.merge(cust_stats1, on="cust_number", how="left")
        df1_clean["invoice_amount"] = df1_clean["total_open_amount"].abs()
        df1_clean["customer_tenure_months"] = 24.0
        df1_clean["is_disputed"] = 0
        df1_clean["source"] = "B2B_Invoices_DS1"

        feature_cols = [
            "invoice_amount",
            "days_until_due",
            "previous_avg_delay",
            "previous_late_payments",
            "customer_invoice_count",
            "customer_tenure_months",
            "is_disputed",
            "delay_days",
            "source",
        ]
        frames.append(df1_clean[feature_cols])
        print(f"    -> Extracted {len(df1_clean)} records from Dataset 1.")

    # =========================================================================
    # 2. Dataset 2: IBM Accounts Receivable Dataset (2,466 records)
    # =========================================================================
    if os.path.exists(ds2_path):
        print(f"[*] Processing Dataset 2 from {ds2_path}...")
        df2 = pd.read_csv(ds2_path)
        df2["InvoiceDate"] = pd.to_datetime(df2["InvoiceDate"], errors="coerce")
        df2["DueDate"] = pd.to_datetime(df2["DueDate"], errors="coerce")
        df2["days_until_due"] = (df2["DueDate"] - df2["InvoiceDate"]).dt.days.clip(1, 180).fillna(30)
        df2["is_late"] = (df2["DaysLate"] > 0).astype(int)
        df2["is_disputed"] = (df2["Disputed"] == "Yes").astype(int)

        cust_stats2 = df2.groupby("customerID").agg(
            previous_avg_delay=("DaysLate", "mean"),
            previous_late_payments=("is_late", "sum"),
            customer_invoice_count=("invoiceNumber", "count"),
        ).reset_index()

        df2_clean = df2.merge(cust_stats2, on="customerID", how="left")
        df2_clean["invoice_amount"] = df2_clean["InvoiceAmount"].abs()
        df2_clean["customer_tenure_months"] = 18.0
        df2_clean["delay_days"] = df2_clean["DaysLate"].astype(float)
        df2_clean["source"] = "AccountsReceivable_DS2"

        frames.append(df2_clean[feature_cols])
        print(f"    -> Extracted {len(df2_clean)} records from Dataset 2.")

    # =========================================================================
    # 3. Dataset 3: Enterprise ERP Customer Payment Behavior Dataset (45,839 records)
    # =========================================================================
    if os.path.exists(ds3_path):
        print(f"[*] Processing Dataset 3 from {ds3_path}...")
        df3 = pd.read_csv(ds3_path)
        df3["Doc_Date"] = pd.to_datetime(df3["Doc_Date"], errors="coerce")
        df3["Net_Due_Date"] = pd.to_datetime(df3["Net_Due_Date"], errors="coerce")
        df3["days_until_due"] = (df3["Net_Due_Date"] - df3["Doc_Date"]).dt.days.clip(1, 180).fillna(30)
        df3["is_late"] = (df3["Days_Overdue_Delay"] > 0).astype(int)

        cust_stats3 = df3.groupby("Cust_Num").agg(
            previous_avg_delay=("Days_Overdue_Delay", "mean"),
            previous_late_payments=("is_late", "sum"),
            customer_invoice_count=("Document_No", "count"),
        ).reset_index()

        df3_clean = df3.merge(cust_stats3, on="Cust_Num", how="left")
        df3_clean["invoice_amount"] = df3_clean["Amount"].abs()
        df3_clean["customer_tenure_months"] = df3_clean["Age_Of_Customer_Months"].fillna(12.0)
        df3_clean["is_disputed"] = 0
        df3_clean["delay_days"] = df3_clean["Days_Overdue_Delay"].astype(float)
        df3_clean["source"] = "EnterpriseERP_DS3"

        frames.append(df3_clean[feature_cols])
        print(f"    -> Extracted {len(df3_clean)} records from Dataset 3.")

    if not frames:
        raise FileNotFoundError("No datasets could be found in the specified directory.")

    unified = pd.concat(frames, ignore_index=True)

    # Clean & bounds check
    unified["delay_days"] = unified["delay_days"].clip(-15, 120)
    unified["previous_avg_delay"] = unified["previous_avg_delay"].clip(-15, 120).fillna(0)
    unified["previous_late_payments"] = unified["previous_late_payments"].clip(0, 500).fillna(0)
    unified["customer_invoice_count"] = unified["customer_invoice_count"].clip(1, 10000).fillna(1)
    unified["customer_tenure_months"] = unified["customer_tenure_months"].clip(1, 120).fillna(12)
    unified["invoice_amount"] = unified["invoice_amount"].clip(100, 100000000).fillna(50000)
    unified["days_until_due"] = unified["days_until_due"].clip(1, 180).fillna(30)
    unified["is_delayed"] = (unified["delay_days"] > 0).astype(int)

    def compute_risk(delay):
        if delay <= 5:
            return "LOW"
        elif delay <= 15:
            return "MEDIUM"
        elif delay <= 30:
            return "HIGH"
        else:
            return "CRITICAL"

    unified["risk_category"] = unified["delay_days"].apply(compute_risk)

    unified.to_csv(output_path, index=False)
    print(f"\n[SUCCESS] Created unified training dataset with {len(unified):,} records.")
    print(f"[+] Saved to: {output_path}")
    return unified


if __name__ == "__main__":
    prepare_unified_dataset()
