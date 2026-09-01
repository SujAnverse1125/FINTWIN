import os
import random
import pandas as pd


random.seed(42)


CUSTOMERS = [
    "Customer A",
    "Customer B",
    "Customer C",
    "Customer D",
    "Customer E",
    "Customer F",
    "Customer G",
    "Customer H",
    "Customer I",
    "Customer J",
]


rows = []


for i in range(1000):
    customer = random.choice(CUSTOMERS)
    invoice_amount = random.randint(50000, 1000000)
    days_until_due = random.choice([7, 15, 30, 45, 60])
    previous_avg_delay = random.randint(0, 40)
    previous_late_payments = random.randint(0, 10)
    customer_invoice_count = random.randint(1, 50)

    # Synthetic relationship
    base_delay = previous_avg_delay * 0.65 + previous_late_payments * 1.8
    amount_factor = 3 if invoice_amount > 700000 else 0
    due_factor = 2 if days_until_due <= 15 else 0
    noise = random.gauss(0, 5)

    payment_delay_days = max(
        0,
        round(base_delay + amount_factor + due_factor + noise),
    )

    rows.append(
        {
            "customer": customer,
            "invoice_amount": invoice_amount,
            "days_until_due": days_until_due,
            "previous_avg_delay": previous_avg_delay,
            "previous_late_payments": previous_late_payments,
            "customer_invoice_count": customer_invoice_count,
            "payment_delay_days": payment_delay_days,
        }
    )


df = pd.DataFrame(rows)

current_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.abspath(os.path.join(current_dir, "..", "..", "data", "payment_history.csv"))
os.makedirs(os.path.dirname(output_path), exist_ok=True)

df.to_csv(output_path, index=False)

print(f"Generated {len(df)} training records.")
print(f"Saved to {output_path}")
print(df.head())