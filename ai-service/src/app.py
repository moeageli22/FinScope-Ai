"""
FinScope AI - FastAPI Service
Connects AI models to the frontend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

# Import your AI models
from models.spending_predictor import predict_spending
from models.budget_optimizer import optimize_budget

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="FinScope AI API",
    description="AI-powered financial insights and predictions",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI at http://localhost:8000/docs
    redoc_url="/redoc"  # ReDoc at http://localhost:8000/redoc
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative React port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========================================
# Pydantic Models (Request/Response Schemas)
# ========================================

class Transaction(BaseModel):
    amount: float = Field(..., description="Transaction amount")
    category: str = Field(default="Other", description="Transaction category")
    description: Optional[str] = Field(None, description="Transaction description")
    date: Optional[str] = Field(None, description="Transaction date")


class SpendingPredictionRequest(BaseModel):
    transactions: List[Transaction]
    user_id: Optional[str] = None
    prediction_period: str = Field(default="next_month", description="Prediction period")


class SpendingPredictionResponse(BaseModel):
    success: bool
    prediction: Dict[str, Any]


class BudgetOptimizationRequest(BaseModel):
    current_spending: Dict[str, float]
    income: float
    goals: Optional[List[str]] = []


class BudgetOptimizationResponse(BaseModel):
    success: bool
    optimized_budget: Dict[str, Any]


class InsightsRequest(BaseModel):
    user_id: str
    timeframe: str = "last_30_days"


class TransactionCategorizationRequest(BaseModel):
    description: str
    amount: float
    merchant: Optional[str] = ""


# ========================================
# API Endpoints
# ========================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "FinScope AI",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
async def health_check():
    """Check if AI service is running"""
    return {
        "status": "healthy",
        "service": "FinScope AI",
        "version": "1.0.0",
        "framework": "FastAPI"
    }


@app.post("/api/predict-spending", response_model=SpendingPredictionResponse)
async def predict_spending_api(request: SpendingPredictionRequest):
    """
    Predict user's future spending based on transaction history

    - **transactions**: List of past transactions
    - **user_id**: User identifier (optional)
    - **prediction_period**: Time period for prediction

    Returns prediction with confidence level and breakdown
    """
    try:
        # Convert Pydantic models to dict
        transactions_dict = [t.dict() for t in request.transactions]

        # Call AI model
        prediction = predict_spending(
            transactions=transactions_dict,
            user_id=request.user_id,
            period=request.prediction_period
        )

        return {
            "success": True,
            "prediction": prediction
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize-budget", response_model=BudgetOptimizationResponse)
async def optimize_budget_api(request: BudgetOptimizationRequest):
    """
    Optimize user's budget based on spending patterns

    - **current_spending**: Dictionary of current spending by category
    - **income**: Monthly income amount
    - **goals**: List of financial goals (optional)

    Returns optimized budget recommendations
    """
    try:
        # Call AI model
        optimized_budget = optimize_budget(
            current_spending=request.current_spending,
            income=request.income,
            goals=request.goals
        )

        return {
            "success": True,
            "optimized_budget": optimized_budget
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/insights")
async def get_insights(request: InsightsRequest):
    """
    Generate AI-powered financial insights

    - **user_id**: User identifier
    - **timeframe**: Analysis timeframe (last_30_days, last_90_days, etc.)

    Returns personalized financial insights
    """
    try:
        # Mock insights (replace with real AI later)
        insights = {
            'spending_trends': 'Your dining expenses increased 15% this month',
            'savings_opportunity': 'You could save $200 by reducing entertainment',
            'unusual_activity': 'Large purchase detected: $500 on electronics',
            'recommendations': [
                'Set a dining budget of $400/month',
                'Consider switching to a no-fee credit card',
                'You\'re on track to meet your savings goal'
            ]
        }

        return {
            "success": True,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/categorize-transaction")
async def categorize_transaction(request: TransactionCategorizationRequest):
    """
    Automatically categorize a transaction using AI

    - **description**: Transaction description
    - **amount**: Transaction amount
    - **merchant**: Merchant name (optional)

    Returns predicted category with confidence score
    """
    try:
        # Simple categorization logic (replace with ML model)
        description = request.description.lower()

        if 'uber' in description or 'lyft' in description:
            category = 'Transportation'
        elif 'starbucks' in description or 'restaurant' in description:
            category = 'Dining'
        elif 'amazon' in description or 'target' in description:
            category = 'Shopping'
        elif 'netflix' in description or 'spotify' in description:
            category = 'Entertainment'
        else:
            category = 'Other'

        return {
            "success": True,
            "category": category,
            "confidence": 0.85
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========================================
# Startup Event
# ========================================

@app.on_event("startup")
async def startup_event():
    """Run when API starts"""
    print("""
    ╔══════════════════════════════════════════════╗
    ║      FinScope AI - FastAPI Service           ║
    ╠══════════════════════════════════════════════╣
    ║  🚀 Server Running                           ║
    ║  📊 Swagger Docs: http://localhost:8000/docs ║
    ║  📖 ReDoc: http://localhost:8000/redoc       ║
    ║  🔧 Framework: FastAPI                       ║
    ╚══════════════════════════════════════════════╝
    """)


# ========================================
# Run Server with Uvicorn
# ========================================

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv('PORT', 8000))

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )