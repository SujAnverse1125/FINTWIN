"""
FinTwin AI Suggestion Engine for the Shock Simulator.

Takes simulation results + invoice portfolio, runs the ML pipeline
batch inference under stressed conditions, and produces:
- Portfolio risk summary with aggregated distribution
- Top at-risk invoices ranked by predicted delay
- Actionable AI-generated recommendations
"""

from __future__ import annotations
from typing import Any

from app.ml.predict import (
    predict_payment_delay,
    load_pipeline,
    get_model_telemetry,
)


# ==========================================
# HELPERS
# ==========================================

def _safe(value: Any, default: float = 0.0) -> float:
    try:
        return float(value or default)
    except (TypeError, ValueError):
        return default


def _format_inr(value: float) -> str:
    """Format a number into human-readable INR string."""
    v = abs(value)
    if v >= 1_00_00_000:
        return f"₹{value / 1_00_00_000:.2f} Cr"
    if v >= 1_00_000:
        return f"₹{value / 1_00_000:.2f} L"
    if v >= 1_000:
        return f"₹{value / 1_000:.1f}K"
    return f"₹{value:.0f}"


# ==========================================
# RISK DISTRIBUTION
# ==========================================

RISK_TIERS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]


def _compute_portfolio_risk(
    invoices: list[dict],
    delay_offset: float = 0.0,
    revenue_factor: float = 1.0,
) -> dict:
    """
    Run ML inference on each unpaid invoice and aggregate risk distribution.
    delay_offset: extra days added to simulated delay (from shock slider)
    revenue_factor: multiplier on receivable amounts (1 + revenue_change/100)
    """
    pipeline = load_pipeline()
    tier_counts = {t: 0 for t in RISK_TIERS}
    total_amount = 0.0
    tier_amounts = {t: 0.0 for t in RISK_TIERS}
    scored_invoices: list[dict] = []

    for inv in invoices:
        status = str(inv.get("status", "") or "").lower()
        if status == "paid":
            continue

        amount = _safe(inv.get("amount") or inv.get("invoice_amount"), 0.0)
        if amount <= 0:
            continue

        # Apply revenue shock to the amount for scoring context
        stressed_amount = amount * revenue_factor

        days_until_due = int(_safe(inv.get("days_until_due") or inv.get("daysUntilDue"), 30))
        prev_avg = _safe(inv.get("previous_avg_delay") or inv.get("previousAvgDelay"), 0.0)
        prev_late = int(_safe(inv.get("previous_late_payments") or inv.get("previousLatePayments"), 0))
        cust_count = int(_safe(inv.get("customer_invoice_count") or inv.get("customerInvoiceCount"), 1))
        tenure = _safe(inv.get("customer_tenure_months") or inv.get("customerTenureMonths"), 12.0)
        disputed = int(1 if inv.get("is_disputed") or inv.get("isDisputed") else 0)
        due_date = inv.get("due_date") or inv.get("dueDate")

        # Simulate the delay offset by reducing days_until_due
        effective_days = max(1, days_until_due - int(delay_offset))

        pred = predict_payment_delay(
            invoice_amount=stressed_amount,
            days_until_due=effective_days,
            previous_avg_delay=prev_avg + delay_offset * 0.3,
            previous_late_payments=prev_late,
            customer_invoice_count=cust_count,
            customer_tenure_months=tenure,
            is_disputed=disputed,
            due_date=due_date,
        )

        risk = pred.get("risk", "LOW")
        delay = pred.get("predicted_delay_days", 0.0)
        confidence = pred.get("confidence_score", 0.0)
        risk_score = pred.get("risk_score", 0.0)

        tier_counts[risk] = tier_counts.get(risk, 0) + 1
        tier_amounts[risk] = tier_amounts.get(risk, 0.0) + amount
        total_amount += amount

        scored_invoices.append({
            "customer": inv.get("customer") or inv.get("name") or "Unknown",
            "invoice_id": inv.get("id") or inv.get("invoiceId") or "—",
            "amount": round(amount, 2),
            "predicted_delay_days": delay,
            "risk": risk,
            "risk_score": risk_score,
            "confidence": confidence,
            "due_date": due_date,
        })

    total_invoices = sum(tier_counts.values())

    # Compute distribution percentages
    distribution = {}
    for tier in RISK_TIERS:
        distribution[tier] = {
            "count": tier_counts[tier],
            "percentage": round(
                (tier_counts[tier] / total_invoices * 100) if total_invoices > 0 else 0, 1
            ),
            "amount": round(tier_amounts[tier], 2),
            "amount_percentage": round(
                (tier_amounts[tier] / total_amount * 100) if total_amount > 0 else 0, 1
            ),
        }

    # Weighted average delay
    weighted_delay = 0.0
    if total_amount > 0:
        for si in scored_invoices:
            weighted_delay += si["predicted_delay_days"] * si["amount"]
        weighted_delay = round(weighted_delay / total_amount, 1)

    # Sort by risk_score descending to get top at-risk
    scored_invoices.sort(key=lambda x: x["risk_score"], reverse=True)

    return {
        "total_invoices_scored": total_invoices,
        "total_amount": round(total_amount, 2),
        "distribution": distribution,
        "weighted_avg_delay": weighted_delay,
        "scored_invoices": scored_invoices,
    }


# ==========================================
# AI SUGGESTION GENERATOR
# ==========================================

def _generate_suggestions(
    base_risk: dict,
    stressed_risk: dict,
    scenarios: list[dict],
    assumptions: dict,
) -> list[dict]:
    """Generate contextual, actionable suggestions from ML analysis."""
    suggestions: list[dict] = []

    base_delay = base_risk.get("weighted_avg_delay", 0)
    stressed_delay = stressed_risk.get("weighted_avg_delay", 0)
    delay_delta = round(stressed_delay - base_delay, 1)

    base_dist = base_risk.get("distribution", {})
    stressed_dist = stressed_risk.get("distribution", {})
    top_invoices = stressed_risk.get("scored_invoices", [])[:5]

    rev_change = _safe(assumptions.get("revenue_change_percent"), 0)
    exp_change = _safe(assumptions.get("expense_change_percent"), 0)
    delay_days = int(_safe(assumptions.get("payment_delay_days"), 0))

    # Find worst scenario
    worst = max(scenarios, key=lambda s: _safe(s.get("liquidity_gap"), 0)) if scenarios else {}

    # ---- Suggestion 1: Delay escalation warning ----
    if delay_delta > 2:
        suggestions.append({
            "priority": "CRITICAL" if delay_delta > 10 else "WARNING",
            "title": "Payment Delay Escalation Detected",
            "description": (
                f"Under the current shock parameters, the ML model predicts your "
                f"weighted average payment delay increases from {base_delay} → {stressed_delay} days "
                f"(+{delay_delta} days). Consider negotiating shorter credit terms with "
                f"high-risk customers or activating early payment incentives."
            ),
            "metric": f"+{delay_delta} days avg delay",
            "category": "payment_delay",
        })

    # ---- Suggestion 2: High-risk concentration ----
    high_pct = _safe(stressed_dist.get("HIGH", {}).get("percentage"), 0)
    critical_pct = _safe(stressed_dist.get("CRITICAL", {}).get("percentage"), 0)
    combined_risk_pct = high_pct + critical_pct

    if combined_risk_pct > 20:
        high_amount = _safe(stressed_dist.get("HIGH", {}).get("amount"), 0)
        critical_amount = _safe(stressed_dist.get("CRITICAL", {}).get("amount"), 0)
        at_risk_amount = high_amount + critical_amount

        suggestions.append({
            "priority": "CRITICAL" if combined_risk_pct > 50 else "WARNING",
            "title": "High Risk Concentration in Portfolio",
            "description": (
                f"{combined_risk_pct:.0f}% of your invoice portfolio ({_format_inr(at_risk_amount)}) "
                f"is classified as HIGH or CRITICAL risk under these stress conditions. "
                f"Consider invoice factoring or supply chain financing to de-risk "
                f"the receivables book."
            ),
            "metric": f"{combined_risk_pct:.0f}% at-risk",
            "category": "portfolio_risk",
        })

    # ---- Suggestion 3: Top at-risk invoice ----
    if top_invoices:
        top = top_invoices[0]
        suggestions.append({
            "priority": "WARNING" if top["risk"] in ("HIGH", "CRITICAL") else "INFO",
            "title": f"Highest Risk: {top['customer']}",
            "description": (
                f"Invoice #{top['invoice_id']} to {top['customer']} "
                f"({_format_inr(top['amount'])}) has a predicted delay of "
                f"{top['predicted_delay_days']} days with {top['confidence']:.0%} confidence. "
                f"Proactively follow up or consider credit insurance for this account."
            ),
            "metric": f"{top['predicted_delay_days']}d delay",
            "category": "invoice_specific",
        })

    # ---- Suggestion 4: Liquidity gap action ----
    gap = _safe(worst.get("liquidity_gap"), 0)
    if gap > 0:
        suggestions.append({
            "priority": "CRITICAL",
            "title": f"Liquidity Gap: {worst.get('scenario', 'Worst Case')}",
            "description": (
                f"The '{worst.get('scenario', 'worst')}' scenario creates a liquidity gap of "
                f"{_format_inr(gap)}. Based on the ML risk profile, approximately "
                f"{combined_risk_pct:.0f}% of receivables face delay. Consider maintaining "
                f"a cash reserve of at least {_format_inr(gap * 1.2)} or arranging "
                f"a working capital line of credit."
            ),
            "metric": _format_inr(gap),
            "category": "liquidity",
        })

    # ---- Suggestion 5: Revenue shock amplification ----
    if rev_change < -10:
        base_low = _safe(base_dist.get("LOW", {}).get("percentage"), 0)
        stressed_low = _safe(stressed_dist.get("LOW", {}).get("percentage"), 0)
        low_drop = round(base_low - stressed_low, 1)

        if low_drop > 5:
            suggestions.append({
                "priority": "WARNING",
                "title": "Revenue Shock Amplifies Payment Risk",
                "description": (
                    f"A {rev_change}% revenue decline causes LOW-risk invoices to drop "
                    f"from {base_low:.0f}% → {stressed_low:.0f}% of the portfolio. "
                    f"The ML model indicates revenue shocks have a compounding effect on "
                    f"debtor payment behavior. Diversify your client base and build "
                    f"contingency reserves."
                ),
                "metric": f"-{low_drop}% safe invoices",
                "category": "revenue_impact",
            })

    # ---- Suggestion 6: Expense buffer recommendation ----
    if exp_change > 15:
        combined_scenario = next(
            (s for s in scenarios if s.get("scenario") == "Combined Shock"),
            None,
        )
        if combined_scenario:
            proj_cash = _safe(combined_scenario.get("projected_cash"), 0)
            suggestions.append({
                "priority": "WARNING" if proj_cash > 0 else "CRITICAL",
                "title": "Expense Surge Buffer Required",
                "description": (
                    f"With a +{exp_change}% expense surge, your combined shock projection "
                    f"lands at {_format_inr(proj_cash)}. The ML portfolio analysis suggests "
                    f"{stressed_delay} days of average receivable delay. Build an "
                    f"operating expense buffer covering at least 45 days of burn rate."
                ),
                "metric": f"+{exp_change}% expenses",
                "category": "expense_management",
            })

    # Always add a baseline safe suggestion if portfolio is mostly healthy
    if not suggestions or combined_risk_pct <= 20:
        low_pct = _safe(stressed_dist.get("LOW", {}).get("percentage"), 0)
        suggestions.append({
            "priority": "SAFE",
            "title": "Portfolio Resilience Assessment",
            "description": (
                f"Under the current stress parameters, {low_pct:.0f}% of your invoices "
                f"remain LOW risk with an average predicted delay of {stressed_delay} days. "
                f"Your receivables portfolio shows adequate resilience. Continue monitoring "
                f"the top accounts flagged above for early warning signals."
            ),
            "metric": f"{low_pct:.0f}% stable",
            "category": "resilience",
        })

    return suggestions


# ==========================================
# MAIN ENTRY POINT
# ==========================================

def generate_ai_suggestions(
    invoices: list[dict],
    simulation_result: dict,
    revenue_change_percent: float = 0,
    expense_change_percent: float = 0,
    payment_delay_days: int = 0,
) -> dict:
    """
    Main function called by the API endpoint.
    Runs ML inference in base and stressed modes, then generates suggestions.
    """

    # Run baseline portfolio risk (no shock applied)
    base_risk = _compute_portfolio_risk(
        invoices=invoices,
        delay_offset=0.0,
        revenue_factor=1.0,
    )

    # Run stressed portfolio risk (with shock parameters)
    stressed_risk = _compute_portfolio_risk(
        invoices=invoices,
        delay_offset=float(payment_delay_days),
        revenue_factor=1.0 + revenue_change_percent / 100.0,
    )

    scenarios = simulation_result.get("scenarios", [])
    assumptions = simulation_result.get("assumptions", {
        "revenue_change_percent": revenue_change_percent,
        "expense_change_percent": expense_change_percent,
        "payment_delay_days": payment_delay_days,
    })

    suggestions = _generate_suggestions(
        base_risk=base_risk,
        stressed_risk=stressed_risk,
        scenarios=scenarios,
        assumptions=assumptions,
    )

    # Model telemetry
    telemetry = get_model_telemetry()

    return {
        "base_portfolio": {
            "total_invoices": base_risk["total_invoices_scored"],
            "total_amount": base_risk["total_amount"],
            "weighted_avg_delay": base_risk["weighted_avg_delay"],
            "distribution": base_risk["distribution"],
        },
        "stressed_portfolio": {
            "total_invoices": stressed_risk["total_invoices_scored"],
            "total_amount": stressed_risk["total_amount"],
            "weighted_avg_delay": stressed_risk["weighted_avg_delay"],
            "distribution": stressed_risk["distribution"],
        },
        "top_risk_invoices": stressed_risk["scored_invoices"][:5],
        "suggestions": suggestions,
        "model_info": {
            "version": telemetry.get("pipeline_version", "2.0.0"),
            "selected_model": telemetry.get("selected_model", "RandomForest"),
            "total_records_trained": telemetry.get("total_records_trained", 88305),
            "confidence": "high" if stressed_risk["total_invoices_scored"] > 0 else "no_data",
        },
    }
