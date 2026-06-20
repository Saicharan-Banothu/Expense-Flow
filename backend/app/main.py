from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.categories import router as categories_router
from app.api.expenses import router as expenses_router
from app.api.budgets import router as budgets_router
from app.api.subscriptions import router as subscriptions_router
from app.api.saving_goals import router as saving_goals_router
from app.api.dashboard import router as dashboard_router

app = FastAPI(
    title="ExpenseFlow AI",
    description="Student Expense Tracker SaaS API",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(categories_router, prefix="/api/categories", tags=["categories"])
app.include_router(expenses_router, prefix="/api/expenses", tags=["expenses"])
app.include_router(budgets_router, prefix="/api/budgets", tags=["budgets"])
app.include_router(subscriptions_router, prefix="/api/subscriptions", tags=["subscriptions"])
app.include_router(saving_goals_router, prefix="/api/saving_goals", tags=["saving goals"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to ExpenseFlow AI API"}
