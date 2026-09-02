from __future__ import annotations
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db, init_db
from app.routes import database_routes

from app.models.business import Business
from app.models.customer import Customer
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.expense import Expense
from app.models.recurring_expense import RecurringExpense

from app.ml.predict import (
    predict_payment_delay,
    predict_batch_payment_delays,
    get_model_telemetry,
)
from app.ml.ai_suggestions import generate_ai_suggestions
from app.services.forecast_service import generate_cash_forecast
from app.services.risk_service import generate_risk_analysis
from app.services.simulator_service import run_simulation
from app.services.financing_service import (
    generate_financing_analysis,
    get_live_financing_news,
)
from app.services.gst_service import (
    calculate_transaction_gst,
    reconcile_overall_gst,
    validate_gstin,
)


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="FinTwin API",
    description="AI-powered financial digital twin for MSMEs",
    version="1.0.0",
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# REQUEST MODELS
# ==========================================

class PaymentPredictionRequest(BaseModel):
    invoice_amount: float
    days_until_due: int = 30
    previous_avg_delay: float = 0.0
    previous_late_payments: int = 0
    customer_invoice_count: int = 1
    customer_tenure_months: float = 12.0
    is_disputed: int = 0
    due_date: str | None = None


class BatchPaymentPredictionRequest(BaseModel):
    invoices: list[dict]


class ForecastRequest(BaseModel):
    current_cash: float
    invoices: list[dict]
    payments: list[dict]
    recurring_expenses: list[dict]
    one_time_expenses: list[dict]


class RiskRequest(BaseModel):
    current_cash: float
    invoices: list[dict]
    recurring_expenses: list[dict]
    one_time_expenses: list[dict]
    forecast: dict


class SimulationRequest(BaseModel):
    current_cash: float
    invoices: list[dict]
    recurring_expenses: list[dict]
    one_time_expenses: list[dict]

    revenue_change_percent: float = 0
    expense_change_percent: float = 0
    payment_delay_days: int = 0
    collection_rate_percent: float = 100.0
    gst_rate_percent: float = 18.0
    additional_revenue: float = 0.0


class SimulatorAIRequest(BaseModel):
    current_cash: float
    invoices: list[dict]
    recurring_expenses: list[dict]
    one_time_expenses: list[dict]
    revenue_change_percent: float = 0
    expense_change_percent: float = 0
    payment_delay_days: int = 0
    collection_rate_percent: float = 100.0
    gst_rate_percent: float = 18.0
    additional_revenue: float = 0.0


class FinancingRequest(BaseModel):
    liquidity_gap: float
    outstanding_receivables: float
    current_cash: float


class GstCalculateRequest(BaseModel):
    amount: float
    rate_percent: float = 18.0
    is_inclusive: bool = False
    is_interstate: bool = False


class GstReconcileRequest(BaseModel):
    invoices: list[dict]
    expenses: list[dict]
    default_gst_rate: float = 18.0


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def serialize_business(business):
    return {
        "id": business.id,
        "name": business.name,
        "industry": business.industry,
        "gstin": business.gstin,
        "currency": business.currency,
        "openingCash": business.opening_cash,
        "monthlyRevenue": business.monthly_revenue,
        "monthlyExpenses": business.monthly_expenses,
    }


def serialize_customer(customer):
    return {
        "id": customer.id,
        "businessId": customer.business_id,
        "name": customer.name,
        "industry": customer.industry,
    }


def serialize_invoice(invoice):
    return {
        "id": invoice.id,
        "businessId": invoice.business_id,
        "customerId": invoice.customer_id,
        "customer": invoice.customer,
        "amount": invoice.amount,
        "invoiceDate": (
            invoice.invoice_date.isoformat()
            if invoice.invoice_date
            else None
        ),
        "dueDate": (
            invoice.due_date.isoformat()
            if invoice.due_date
            else None
        ),
        "status": invoice.status,
        "paymentDate": (
            invoice.payment_date.isoformat()
            if invoice.payment_date
            else None
        ),
        "source": invoice.source,
    }


def serialize_payment(payment):
    return {
        "id": payment.id,
        "businessId": payment.business_id,
        "invoiceId": payment.invoice_id,
        "customerId": payment.customer_id,
        "amount": payment.amount,
        "expectedDate": (
            payment.expected_date.isoformat()
            if payment.expected_date
            else None
        ),
        "actualDate": (
            payment.actual_date.isoformat()
            if payment.actual_date
            else None
        ),
        "daysDelayed": payment.days_delayed,
        "source": payment.source,
    }


def serialize_expense(expense):
    return {
        "id": expense.id,
        "businessId": expense.business_id,
        "category": expense.category,
        "description": expense.description,
        "amount": expense.amount,
        "date": (
            expense.date.isoformat()
            if expense.date
            else None
        ),
        "recurring": expense.recurring,
        "source": expense.source,
    }


def serialize_recurring_expense(expense):
    return {
        "id": expense.id,
        "businessId": expense.business_id,
        "category": expense.category,
        "description": expense.description,
        "amount": expense.amount,
        "frequency": expense.frequency,
        "dayOfMonth": expense.day_of_month,
        "source": expense.source,
    }


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():
    return {
        "message": "FinTwin API is running",
        "status": "healthy",
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "FinTwin Backend",
    }


# ==========================================
# BUSINESS
# ==========================================

@app.get("/api/business")
def get_business(db: Session = Depends(get_db)):

    business = (
        db.query(Business)
        .first()
    )

    if not business:
        return {}

    return serialize_business(business)


# ==========================================
# CUSTOMERS
# ==========================================

@app.get("/api/customers")
def get_customers(
    db: Session = Depends(get_db),
):

    customers = (
        db.query(Customer)
        .all()
    )

    return [
        serialize_customer(customer)
        for customer in customers
    ]


# ==========================================
# INVOICES
# ==========================================

@app.get("/api/invoices")
def get_invoices(
    db: Session = Depends(get_db),
):

    invoices = (
        db.query(Invoice)
        .all()
    )

    return [
        serialize_invoice(invoice)
        for invoice in invoices
    ]


# ==========================================
# PAYMENTS
# ==========================================

@app.get("/api/payments")
def get_payments(
    db: Session = Depends(get_db),
):

    payments = (
        db.query(Payment)
        .all()
    )

    return [
        serialize_payment(payment)
        for payment in payments
    ]


# ==========================================
# EXPENSES
# ==========================================

@app.get("/api/expenses")
def get_expenses(
    db: Session = Depends(get_db),
):

    expenses = (
        db.query(Expense)
        .filter(
            Expense.recurring == False
        )
        .all()
    )

    return [
        serialize_expense(expense)
        for expense in expenses
    ]


# ==========================================
# RECURRING EXPENSES
# ==========================================

@app.get("/api/recurring-expenses")
def get_recurring_expenses(
    db: Session = Depends(get_db),
):

    expenses = (
        db.query(RecurringExpense)
        .all()
    )

    return [
        serialize_recurring_expense(expense)
        for expense in expenses
    ]


# ==========================================
# ML PAYMENT DELAY PREDICTION
# ==========================================

@app.post("/api/ml/predict-payment-delay")
def predict_payment(
    request: PaymentPredictionRequest,
):
    result = predict_payment_delay(
        invoice_amount=request.invoice_amount,
        days_until_due=request.days_until_due,
        previous_avg_delay=request.previous_avg_delay,
        previous_late_payments=request.previous_late_payments,
        customer_invoice_count=request.customer_invoice_count,
        customer_tenure_months=request.customer_tenure_months,
        is_disputed=request.is_disputed,
        due_date=request.due_date,
    )

    return {
        "success": True,
        "prediction": result,
    }


@app.post("/api/ml/predict-batch")
def predict_batch(
    request: BatchPaymentPredictionRequest,
):
    predictions = predict_batch_payment_delays(request.invoices)
    return {
        "success": True,
        "count": len(predictions),
        "invoices": predictions,
    }


@app.get("/api/ml/model-info")
def get_model_info():
    telemetry = get_model_telemetry()
    return {
        "success": True,
        "model": telemetry,
    }


# ==========================================
# AI CASH FLOW FORECAST
# ==========================================

@app.post("/api/forecast")
def create_forecast(
    request: ForecastRequest,
):

    result = generate_cash_forecast(
        current_cash=request.current_cash,
        invoices=request.invoices,
        payments=request.payments,
        recurring_expenses=request.recurring_expenses,
        one_time_expenses=request.one_time_expenses,
    )

    return {
        "success": True,
        "forecast": result,
    }


# ==========================================
# AI RISK ANALYSIS
# ==========================================

@app.post("/api/risk")
def create_risk_analysis(
    request: RiskRequest,
):

    result = generate_risk_analysis(
        current_cash=request.current_cash,
        invoices=request.invoices,
        recurring_expenses=request.recurring_expenses,
        one_time_expenses=request.one_time_expenses,
        forecast=request.forecast,
    )

    return {
        "success": True,
        "risk": result,
    }


# ==========================================
# FINANCIAL SHOCK SIMULATOR
# ==========================================

@app.post("/api/simulator")
def create_simulation(
    request: SimulationRequest,
):

    result = run_simulation(
        current_cash=request.current_cash,
        invoices=request.invoices,
        recurring_expenses=request.recurring_expenses,
        one_time_expenses=request.one_time_expenses,
        revenue_change_percent=request.revenue_change_percent,
        expense_change_percent=request.expense_change_percent,
        payment_delay_days=request.payment_delay_days,
        collection_rate_percent=request.collection_rate_percent,
        gst_rate_percent=request.gst_rate_percent,
        additional_revenue=request.additional_revenue,
    )

    return {
        "success": True,
        "simulation": result,
    }


@app.post("/api/simulator/ai-suggestions")
def get_simulator_ai_suggestions(
    request: SimulatorAIRequest,
):
    # First run the simulation to get scenario results
    sim_result = run_simulation(
        current_cash=request.current_cash,
        invoices=request.invoices,
        recurring_expenses=request.recurring_expenses,
        one_time_expenses=request.one_time_expenses,
        revenue_change_percent=request.revenue_change_percent,
        expense_change_percent=request.expense_change_percent,
        payment_delay_days=request.payment_delay_days,
        collection_rate_percent=request.collection_rate_percent,
        gst_rate_percent=request.gst_rate_percent,
        additional_revenue=request.additional_revenue,
    )

    # Generate AI suggestions using ML pipeline
    ai_result = generate_ai_suggestions(
        invoices=request.invoices,
        simulation_result=sim_result,
        revenue_change_percent=request.revenue_change_percent,
        expense_change_percent=request.expense_change_percent,
        payment_delay_days=request.payment_delay_days,
    )

    return {
        "success": True,
        "ai_insights": ai_result,
    }


# ==========================================
# FINANCING OPTIONS
# ==========================================

@app.post("/api/financing")
def create_financing_analysis(
    request: FinancingRequest,
):

    result = generate_financing_analysis(
        liquidity_gap=request.liquidity_gap,
        outstanding_receivables=request.outstanding_receivables,
        current_cash=request.current_cash,
    )

    return {
        "success": True,
        "financing": result,
    }


@app.get("/api/financing/news")
def get_msme_financing_news():
    news = get_live_financing_news()
    return {
        "success": True,
        "news": news,
    }


# ==========================================
# GST API ENDPOINTS
# ==========================================

@app.post("/api/gst/calculate")
def get_transaction_gst(request: GstCalculateRequest):
    result = calculate_transaction_gst(
        amount=request.amount,
        rate_percent=request.rate_percent,
        is_inclusive=request.is_inclusive,
        is_interstate=request.is_interstate,
    )
    return {
        "success": True,
        "calculation": result,
    }


@app.post("/api/gst/reconcile")
def get_overall_gst_reconciliation(request: GstReconcileRequest):
    result = reconcile_overall_gst(
        invoices=request.invoices,
        expenses=request.expenses,
        default_gst_rate=request.default_gst_rate,
    )
    return {
        "success": True,
        "reconciliation": result,
    }


@app.get("/api/gst/validate/{gstin}")
def get_gstin_validation(gstin: str):
    result = validate_gstin(gstin=gstin)
    return {
        "success": True,
        "validation": result,
    }


# ==========================================
# INCLUDE DATABASE CRUD ROUTER
# ==========================================
app.include_router(database_routes.router)


# ==========================================
# STARTUP INITIALIZATION
# ==========================================
@app.on_event("startup")
def on_startup():
    try:
        init_db()
    except Exception as e:
        print(f"Warning during DB init: {e}")