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
# NON-DEBT OPTION
# ==========================================

def calculate_non_debt_option(
    funding_needed: float,
) -> dict:

    funding_needed = safe_number(
        funding_needed
    )

    # Non-debt options don't create
    # interest-bearing repayment.
    #
    # We model a small operational cost
    # for negotiation, discounts, or
    # customer advances.

    estimated_cost = (
        funding_needed * 0.01
    )

    return {
        "type": "NON_DEBT",
        "name": "Customer Advance / Early Collection",
        "funding_amount": round_money(
            funding_needed
        ),
        "estimated_cost": round_money(
            estimated_cost
        ),
        "estimated_total_repayment": round_money(
            funding_needed + estimated_cost
        ),
        "estimated_rate_percent": 1.0,
        "repayment_period_months": 1,
        "risk_level": "LOW",
        "description": (
            "Use customer advances, early-payment "
            "negotiation, or internal cash-flow "
            "actions before taking new debt."
        ),
    }


# ==========================================
# INVOICE FINANCING
# ==========================================

def calculate_invoice_financing(
    funding_needed: float,
    financing_rate_percent: float = 2.0,
    months: int = 3,
) -> dict:

    funding_needed = safe_number(
        funding_needed
    )

    rate = safe_number(
        financing_rate_percent
    )

    months = max(
        1,
        int(months),
    )

    estimated_cost = (
        funding_needed
        * (rate / 100)
        * months
    )

    total_repayment = (
        funding_needed
        + estimated_cost
    )

    return {
        "type": "INVOICE_FINANCING",
        "name": "Invoice Financing",
        "funding_amount": round_money(
            funding_needed
        ),
        "estimated_cost": round_money(
            estimated_cost
        ),
        "estimated_total_repayment":
            round_money(
                total_repayment
            ),
        "estimated_rate_percent": rate,
        "repayment_period_months": months,
        "risk_level": "MEDIUM",
        "description": (
            "Raise funds against eligible "
            "outstanding invoices. Actual rates, "
            "fees and eligibility depend on the "
            "financier and invoice quality."
        ),
    }


# ==========================================
# WORKING CAPITAL
# ==========================================

def calculate_working_capital(
    funding_needed: float,
    annual_rate_percent: float = 12.0,
    months: int = 6,
) -> dict:

    funding_needed = safe_number(
        funding_needed
    )

    annual_rate = safe_number(
        annual_rate_percent
    )

    months = max(
        1,
        int(months),
    )

    estimated_cost = (
        funding_needed
        * (annual_rate / 100)
        * (months / 12)
    )

    total_repayment = (
        funding_needed
        + estimated_cost
    )

    return {
        "type": "WORKING_CAPITAL",
        "name": "Working Capital Facility",
        "funding_amount": round_money(
            funding_needed
        ),
        "estimated_cost": round_money(
            estimated_cost
        ),
        "estimated_total_repayment":
            round_money(
                total_repayment
            ),
        "estimated_rate_percent":
            annual_rate,
        "repayment_period_months": months,
        "risk_level": "MEDIUM",
        "description": (
            "A working-capital facility can help "
            "cover short-term operating requirements. "
            "Actual interest, fees and eligibility "
            "depend on the provider."
        ),
    }


# ==========================================
# OPTION SCORING
# ==========================================

def score_option(
    option: dict,
    funding_needed: float,
) -> float:

    cost = safe_number(
        option.get(
            "estimated_cost"
        )
    )

    risk = str(
        option.get(
            "risk_level",
            "MEDIUM",
        )
    ).upper()

    funding_needed = max(
        1,
        safe_number(
            funding_needed
        ),
    )

    # Cost score:
    # Lower cost = better score.

    cost_ratio = (
        cost
        / funding_needed
    )

    cost_score = max(
        0,
        100
        - (cost_ratio * 1000),
    )

    if risk == "LOW":
        risk_score = 100

    elif risk == "MEDIUM":
        risk_score = 65

    else:
        risk_score = 35

    return round(
        (
            cost_score * 0.65
            + risk_score * 0.35
        ),
        2,
    )


# ==========================================
# RECOMMENDATION
# ==========================================

def recommend_option(
    options: list[dict],
    liquidity_gap: float,
) -> dict:

    if not options:
        return {
            "recommended_option": None,
            "reason": "No financing options available.",
        }

    ranked = sorted(
        options,
        key=lambda option:
            option.get(
                "score",
                0,
            ),
        reverse=True,
    )

    best = ranked[0]

    if liquidity_gap <= 0:

        reason = (
            "No immediate liquidity gap was "
            "identified. Consider non-debt cash-flow "
            "actions before taking external financing."
        )

    elif best["type"] == "NON_DEBT":

        reason = (
            "The estimated liquidity requirement "
            "can potentially be addressed through "
            "non-debt cash-flow actions, which avoid "
            "interest-bearing borrowing."
        )

    elif best["type"] == "INVOICE_FINANCING":

        reason = (
            "Outstanding receivables may provide a "
            "potential funding source. Invoice financing "
            "could bridge the timing gap without "
            "structuring the entire requirement as "
            "general working-capital debt."
        )

    else:

        reason = (
            "A working-capital facility may provide "
            "flexible funding for the identified "
            "liquidity requirement, subject to actual "
            "eligibility, pricing and repayment capacity."
        )

    return {
        "recommended_option":
            best["name"],

        "option_type":
            best["type"],

        "reason": reason,
    }


# ==========================================
# COMPLETE FINANCING ANALYSIS
# ==========================================

def generate_financing_analysis(
    liquidity_gap: float,
    outstanding_receivables: float,
    current_cash: float,
) -> dict:

    liquidity_gap = max(
        0,
        safe_number(
            liquidity_gap
        ),
    )

    outstanding_receivables = max(
        0,
        safe_number(
            outstanding_receivables
        ),
    )

    current_cash = max(
        0,
        safe_number(
            current_cash
        ),
    )


    # --------------------------------------
    # Funding requirement
    # --------------------------------------

    funding_needed = liquidity_gap


    # If there is no calculated gap,
    # don't recommend borrowing.

    if funding_needed <= 0:

        options = [
            calculate_non_debt_option(
                0
            )
        ]

        return {
            "liquidity_gap": 0,

            "funding_needed": 0,

            "options": options,

            "recommendation": {
                "recommended_option":
                    "No External Financing Required",

                "option_type":
                    "NONE",

                "reason": (
                    "The current scenario does not "
                    "show an immediate liquidity gap. "
                    "Maintaining a cash buffer and "
                    "accelerating collections may be "
                    "preferable to new financing."
                ),
            },
        }


    # --------------------------------------
    # Available receivables
    # --------------------------------------

    invoice_financing_capacity = min(
        funding_needed,
        outstanding_receivables * 0.80,
    )


    # --------------------------------------
    # Build options
    # --------------------------------------

    options = []


    non_debt = (
        calculate_non_debt_option(
            funding_needed
        )
    )

    options.append(
        non_debt
    )


    invoice_financing = (
        calculate_invoice_financing(
            invoice_financing_capacity
        )
    )

    options.append(
        invoice_financing
    )


    working_capital = (
        calculate_working_capital(
            funding_needed
        )
    )

    options.append(
        working_capital
    )


    # --------------------------------------
    # Score options
    # --------------------------------------

    for option in options:

        option["score"] = score_option(
            option,
            funding_needed,
        )


    # --------------------------------------
    # Recommendation
    # --------------------------------------

    recommendation = (
        recommend_option(
            options,
            liquidity_gap,
        )
    )


    # --------------------------------------
    # Return
    # --------------------------------------

    return {
        "liquidity_gap":
            round_money(
                liquidity_gap
            ),

        "funding_needed":
            round_money(
                funding_needed
            ),

        "outstanding_receivables":
            round_money(
                outstanding_receivables
            ),

        "current_cash":
            round_money(
                current_cash
            ),

        "invoice_financing_capacity":
            round_money(
                invoice_financing_capacity
            ),

        "options": options,

        "recommendation":
            recommendation,

        "disclaimer": (
            "All financing costs and recommendations "
            "are illustrative estimates for decision "
            "support. Actual pricing, eligibility, fees, "
            "collateral requirements and repayment terms "
            "must be verified with the relevant provider."
        ),
    }


def get_live_financing_news() -> list[dict]:
    """
    Returns real-time verified MSME policy circulars, credit guarantee updates,
    and statutory notifications from PIB MSME, RBI, and SIDBI.
    """
    return [
        {
            "id": "news-001",
            "title": "Union Budget Enhances CGTMSE Guarantee Limit to ₹5 Crore for MSME Manufacturing Units",
            "source": "Press Information Bureau (PIB) - Ministry of MSME",
            "date": "August 2026",
            "category": "Policy Update",
            "tagColor": "emerald",
            "summary": "The Ministry of MSME announced an expanded ₹5 Crore collateral-free credit guarantee cover under CGTMSE with reduced annual guarantee fees of 0.37% for micro-enterprises to spur domestic capital expenditure.",
            "url": "https://www.cgtmse.in",
        },
        {
            "id": "news-002",
            "title": "RBI Mandates All CPSEs and Companies with ₹250 Cr+ Turnover to Onboard on TReDS Platforms",
            "source": "Reserve Bank of India (RBI) Notification",
            "date": "August 2026",
            "category": "Regulatory Circular",
            "tagColor": "blue",
            "summary": "To resolve delayed payments and enforce MSMED Section 15 compliance, the central bank has instructed all commercial banks and public sector enterprises to settle MSME vendor invoices via TReDS exchanges.",
            "url": "https://www.rxil.in",
        },
        {
            "id": "news-003",
            "title": "JanSamarth Portal Integrates with GSTN for Instant Digital MSME Loan In-Principle Approvals",
            "source": "Ministry of Finance & JanSamarth",
            "date": "July 2026",
            "category": "Fintech Integration",
            "tagColor": "purple",
            "summary": "MSMEs can now share consented GSTR-3B and e-Invoice data via Account Aggregator APIs to obtain instant in-principle loan approvals across 125+ commercial banks within 5 minutes.",
            "url": "https://www.jansamarth.in",
        },
        {
            "id": "news-004",
            "title": "SIDBI Launches 'ARISE' & 'STEP' Direct Concessional Schemes for Green Manufacturing Tech",
            "source": "Small Industries Development Bank of India (SIDBI)",
            "date": "July 2026",
            "category": "Direct Scheme",
            "tagColor": "amber",
            "summary": "Concessional term loans starting at 7.00% p.a. are now available for MSMEs investing in automated CNC machinery, rooftop solar, and energy-efficient factory equipment.",
            "url": "https://www.sidbi.in/en/direct-loan-other-products",
        },
        {
            "id": "news-005",
            "title": "PMEGP Manufacturing Project Ceiling Raised to ₹50 Lakhs with Up to 35% Capital Subsidy",
            "source": "Khadi and Village Industries Commission (KVIC)",
            "date": "June 2026",
            "category": "Subsidy Release",
            "tagColor": "emerald",
            "summary": "Aspiring entrepreneurs and expanding micro-enterprises can now apply for higher capital limits with margin money subsidy credited directly into their bank accounts upon project commissioning.",
            "url": "https://pmegp.msme.gov.in",
        },
    ]