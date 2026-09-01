from typing import Any


# ==========================================
# HELPERS
# ==========================================

def safe_number(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def round_money(value: float) -> float:
    return round(value, 2)


# ==========================================
# BASE FINANCIAL POSITION
# ==========================================

def calculate_base_position(
    current_cash: float,
    invoices: list[dict],
    recurring_expenses: list[dict],
    one_time_expenses: list[dict],
) -> dict:

    current_cash = safe_number(current_cash)

    receivables = sum(
        safe_number(invoice.get("amount"))
        for invoice in invoices
        if str(
            invoice.get("status", "")
        ).lower() != "paid"
    )

    recurring = sum(
        safe_number(expense.get("amount"))
        for expense in recurring_expenses
    )

    one_time = sum(
        safe_number(expense.get("amount"))
        for expense in one_time_expenses
    )

    total_expenses = recurring + one_time

    net_position = (
        current_cash
        + receivables
        - total_expenses
    )

    return {
        "current_cash": round_money(
            current_cash
        ),
        "receivables": round_money(
            receivables
        ),
        "recurring_expenses": round_money(
            recurring
        ),
        "one_time_expenses": round_money(
            one_time
        ),
        "total_expenses": round_money(
            total_expenses
        ),
        "net_position": round_money(
            net_position
        ),
    }


# ==========================================
# REVENUE SHOCK
# ==========================================

def simulate_revenue_shock(
    base: dict,
    revenue_change_percent: float,
) -> dict:

    change = safe_number(
        revenue_change_percent
    )

    receivables = safe_number(
        base["receivables"]
    )

    adjusted_receivables = (
        receivables
        * (1 + change / 100)
    )

    cash_position = (
        safe_number(
            base["current_cash"]
        )
        + adjusted_receivables
        - safe_number(
            base["total_expenses"]
        )
    )

    return {
        "scenario": "Revenue Shock",

        "revenue_change_percent": change,

        "adjusted_receivables":
            round_money(
                adjusted_receivables
            ),

        "projected_cash":
            round_money(
                cash_position
            ),

        "cash_impact":
            round_money(
                cash_position
                - base["net_position"]
            ),
    }


# ==========================================
# EXPENSE SHOCK
# ==========================================

def simulate_expense_shock(
    base: dict,
    expense_change_percent: float,
) -> dict:

    change = safe_number(
        expense_change_percent
    )

    expenses = safe_number(
        base["total_expenses"]
    )

    adjusted_expenses = (
        expenses
        * (1 + change / 100)
    )

    cash_position = (
        safe_number(
            base["current_cash"]
        )
        + safe_number(
            base["receivables"]
        )
        - adjusted_expenses
    )

    return {
        "scenario": "Expense Shock",

        "expense_change_percent": change,

        "adjusted_expenses":
            round_money(
                adjusted_expenses
            ),

        "projected_cash":
            round_money(
                cash_position
            ),

        "cash_impact":
            round_money(
                cash_position
                - base["net_position"]
            ),
    }


# ==========================================
# PAYMENT DELAY SHOCK
# ==========================================

def simulate_payment_delay(
    base: dict,
    delay_days: int,
) -> dict:

    delay_days = int(
        safe_number(delay_days)
    )

    receivables = safe_number(
        base["receivables"]
    )

    # Estimate the proportion of receivables
    # delayed based on the shock duration.
    #
    # This is intentionally a scenario model,
    # not a lending decision.

    if delay_days <= 0:
        delayed_percentage = 0

    elif delay_days <= 15:
        delayed_percentage = 25

    elif delay_days <= 30:
        delayed_percentage = 50

    elif delay_days <= 60:
        delayed_percentage = 75

    else:
        delayed_percentage = 100

    delayed_amount = (
        receivables
        * delayed_percentage
        / 100
    )

    immediately_available_receivables = (
        receivables
        - delayed_amount
    )

    projected_cash = (
        safe_number(
            base["current_cash"]
        )
        + immediately_available_receivables
        - safe_number(
            base["total_expenses"]
        )
    )

    liquidity_gap = max(
        0,
        -projected_cash,
    )

    return {
        "scenario": "Payment Delay",

        "delay_days": delay_days,

        "delayed_percentage":
            delayed_percentage,

        "delayed_amount":
            round_money(
                delayed_amount
            ),

        "projected_cash":
            round_money(
                projected_cash
            ),

        "liquidity_gap":
            round_money(
                liquidity_gap
            ),

        "cash_impact":
            round_money(
                projected_cash
                - base["net_position"]
            ),
    }


# ==========================================
# COMBINED SHOCK
# ==========================================

def simulate_combined_shock(
    base: dict,
    revenue_change_percent: float,
    expense_change_percent: float,
    payment_delay_days: int,
) -> dict:

    revenue_change = safe_number(
        revenue_change_percent
    )

    expense_change = safe_number(
        expense_change_percent
    )

    delay_days = int(
        safe_number(
            payment_delay_days
        )
    )

    # ------------------------------
    # Revenue impact
    # ------------------------------

    receivables = safe_number(
        base["receivables"]
    )

    adjusted_receivables = (
        receivables
        * (1 + revenue_change / 100)
    )

    # ------------------------------
    # Payment delay impact
    # ------------------------------

    if delay_days <= 0:
        delayed_percentage = 0

    elif delay_days <= 15:
        delayed_percentage = 25

    elif delay_days <= 30:
        delayed_percentage = 50

    elif delay_days <= 60:
        delayed_percentage = 75

    else:
        delayed_percentage = 100

    delayed_amount = (
        adjusted_receivables
        * delayed_percentage
        / 100
    )

    available_receivables = (
        adjusted_receivables
        - delayed_amount
    )

    # ------------------------------
    # Expense impact
    # ------------------------------

    expenses = safe_number(
        base["total_expenses"]
    )

    adjusted_expenses = (
        expenses
        * (1 + expense_change / 100)
    )

    # ------------------------------
    # Final position
    # ------------------------------

    projected_cash = (
        safe_number(
            base["current_cash"]
        )
        + available_receivables
        - adjusted_expenses
    )

    liquidity_gap = max(
        0,
        -projected_cash,
    )

    return {
        "scenario": "Combined Shock",

        "revenue_change_percent":
            revenue_change,

        "expense_change_percent":
            expense_change,

        "payment_delay_days":
            delay_days,

        "adjusted_receivables":
            round_money(
                adjusted_receivables
            ),

        "delayed_amount":
            round_money(
                delayed_amount
            ),

        "adjusted_expenses":
            round_money(
                adjusted_expenses
            ),

        "projected_cash":
            round_money(
                projected_cash
            ),

        "liquidity_gap":
            round_money(
                liquidity_gap
            ),

        "cash_impact":
            round_money(
                projected_cash
                - base["net_position"]
            ),
    }


# ==========================================
# RISK CLASSIFICATION
# ==========================================

def classify_scenario(
    projected_cash: float,
    liquidity_gap: float,
) -> str:

    projected_cash = safe_number(
        projected_cash
    )

    liquidity_gap = safe_number(
        liquidity_gap
    )

    if liquidity_gap > 0:
        return "HIGH"

    if projected_cash <= 0:
        return "HIGH"

    if projected_cash < 100000:
        return "MEDIUM"

    return "LOW"


# ==========================================
# SCENARIO EXPLANATION
# ==========================================

def explain_scenario(
    scenario: dict,
) -> str:

    scenario_name = scenario.get(
        "scenario",
        "Scenario",
    )

    projected_cash = safe_number(
        scenario.get(
            "projected_cash"
        )
    )

    liquidity_gap = safe_number(
        scenario.get(
            "liquidity_gap"
        )
    )

    if liquidity_gap > 0:

        return (
            f"{scenario_name} creates a "
            f"potential liquidity gap of "
            f"₹{liquidity_gap:,.0f}. "
            "The business may need to reduce "
            "outflows, accelerate collections, "
            "or consider suitable working-capital "
            "options."
        )

    if projected_cash <= 0:

        return (
            f"{scenario_name} causes projected "
            "cash to fall to zero or below. "
            "Immediate cash-flow management "
            "would be important."
        )

    if projected_cash < 100000:

        return (
            f"{scenario_name} significantly "
            "reduces available cash and leaves "
            "a relatively small liquidity buffer."
        )

    return (
        f"{scenario_name} does not create an "
        "immediate liquidity gap under the "
        "selected assumptions."
    )


# ==========================================
# COMPLETE SIMULATION
# ==========================================

def run_simulation(
    current_cash: float,
    invoices: list[dict],
    recurring_expenses: list[dict],
    one_time_expenses: list[dict],
    revenue_change_percent: float = 0,
    expense_change_percent: float = 0,
    payment_delay_days: int = 0,
    collection_rate_percent: float = 100,
    gst_rate_percent: float = 18,
    additional_revenue: float = 0,
) -> dict:

    # --------------------------------------
    # Calculate base position
    # --------------------------------------

    base = calculate_base_position(
        current_cash=current_cash,
        invoices=invoices,
        recurring_expenses=recurring_expenses,
        one_time_expenses=one_time_expenses,
    )

    # --------------------------------------
    # Base scenario
    # --------------------------------------

    base_scenario = {
        "scenario": "Base Case",
        "projected_cash": base["net_position"],
        "cash_impact": 0,
        "liquidity_gap": max(0, -base["net_position"]),
    }

    base_scenario["risk"] = classify_scenario(
        base_scenario["projected_cash"],
        base_scenario["liquidity_gap"],
    )

    base_scenario["explanation"] = "Current financial position without applying any additional shock."

    # --------------------------------------
    # Revenue scenario (factoring in collection rate and additional revenue)
    # --------------------------------------

    effective_revenue_change = revenue_change_percent
    revenue_scenario = simulate_revenue_shock(
        base,
        effective_revenue_change,
    )
    # Apply collection rate and additional revenue
    coll_factor = max(0.1, min(1.0, collection_rate_percent / 100.0))
    revenue_scenario["projected_cash"] = round_money(
        revenue_scenario["projected_cash"] * coll_factor + safe_number(additional_revenue)
    )
    revenue_scenario["cash_impact"] = round_money(
        revenue_scenario["projected_cash"] - base["net_position"]
    )

    revenue_scenario["liquidity_gap"] = max(
        0,
        -revenue_scenario["projected_cash"],
    )

    revenue_scenario["risk"] = classify_scenario(
        revenue_scenario["projected_cash"],
        revenue_scenario["liquidity_gap"],
    )

    revenue_scenario["explanation"] = explain_scenario(revenue_scenario)

    # --------------------------------------
    # Expense scenario (factoring in GST rate)
    # --------------------------------------

    gst_factor = 1.0 + (safe_number(gst_rate_percent) - 18.0) / 100.0
    effective_expense_change = (1.0 + safe_number(expense_change_percent) / 100.0) * gst_factor - 1.0
    effective_expense_change = effective_expense_change * 100.0

    expense_scenario = simulate_expense_shock(
        base,
        effective_expense_change,
    )

    expense_scenario["liquidity_gap"] = max(
        0,
        -expense_scenario["projected_cash"],
    )

    expense_scenario["risk"] = classify_scenario(
        expense_scenario["projected_cash"],
        expense_scenario["liquidity_gap"],
    )

    expense_scenario["explanation"] = explain_scenario(expense_scenario)

    # --------------------------------------
    # Payment delay scenario
    # --------------------------------------

    payment_scenario = simulate_payment_delay(
        base,
        payment_delay_days,
    )

    payment_scenario["risk"] = classify_scenario(
        payment_scenario["projected_cash"],
        payment_scenario["liquidity_gap"],
    )

    payment_scenario["explanation"] = explain_scenario(payment_scenario)

    # --------------------------------------
    # Combined scenario
    # --------------------------------------

    combined_scenario = simulate_combined_shock(
        base=base,
        revenue_change_percent=revenue_change_percent,
        expense_change_percent=effective_expense_change,
        payment_delay_days=payment_delay_days,
    )

    # Apply collection rate and additional revenue to combined
    combined_scenario["projected_cash"] = round_money(
        (combined_scenario["projected_cash"] + safe_number(additional_revenue)) * coll_factor
    )
    combined_scenario["cash_impact"] = round_money(
        combined_scenario["projected_cash"] - base["net_position"]
    )
    combined_scenario["liquidity_gap"] = max(
        0,
        -combined_scenario["projected_cash"],
    )

    combined_scenario["risk"] = classify_scenario(
        combined_scenario["projected_cash"],
        combined_scenario["liquidity_gap"],
    )

    combined_scenario["explanation"] = explain_scenario(combined_scenario)

    # --------------------------------------
    # Return complete simulation
    # --------------------------------------

    return {
        "base": base,
        "assumptions": {
            "revenue_change_percent": safe_number(revenue_change_percent),
            "expense_change_percent": safe_number(expense_change_percent),
            "payment_delay_days": int(safe_number(payment_delay_days)),
            "collection_rate_percent": safe_number(collection_rate_percent),
            "gst_rate_percent": safe_number(gst_rate_percent),
            "additional_revenue": safe_number(additional_revenue),
        },
        "scenarios": [
            base_scenario,
            revenue_scenario,
            expense_scenario,
            payment_scenario,
            combined_scenario,
        ],
    }