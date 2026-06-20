from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.api import deps
from app.models.expense import Expense
from app.models.expense import Category
from app.models.budget import Budget
from app.models.user import User
from app.schemas.dashboard import DashboardMetrics, CategoryExpense, DailyExpense

router = APIRouter()

@router.get("/", response_model=DashboardMetrics)
def get_dashboard_metrics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    user_id = current_user.id
    now = datetime.utcnow()
    first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Total Expenses
    total_expenses = db.query(func.sum(Expense.amount)).filter(Expense.user_id == user_id).scalar() or 0.0
    
    # This Month Expenses
    this_month_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user_id,
        Expense.date >= first_day_of_month.date()
    ).scalar() or 0.0

    # Active Categories
    active_categories = db.query(Category).filter(
        Category.user_id == user_id
    ).count()

    # Budget Used Percentage
    # Simplification: Compare this month's expenses to the sum of all monthly budgets
    total_monthly_budget = db.query(func.sum(Budget.amount)).filter(
        Budget.user_id == user_id,
        Budget.month == now.month,
        Budget.year == now.year
    ).scalar() or 0.0

    budget_used_percentage = 0.0
    remaining_budget = float(total_monthly_budget) - float(this_month_expenses)
    
    if total_monthly_budget > 0:
        budget_used_percentage = min(100.0, (this_month_expenses / total_monthly_budget) * 100.0)
    else:
        remaining_budget = 0.0

    # Expenses by Category (All time or this month, let's do this month for relevance)
    category_expenses_query = db.query(
        Category.name,
        Category.color,
        func.sum(Expense.amount).label("total")
    ).join(Expense, Expense.category_id == Category.id).filter(
        Expense.user_id == user_id,
        Expense.date >= first_day_of_month.date()
    ).group_by(Category.id).all()

    expenses_by_category = [
        CategoryExpense(name=r.name, color=r.color, total=float(r.total))
        for r in category_expenses_query
    ]

    # Recent Daily Expenses (Last 7 days)
    seven_days_ago = now.date() - timedelta(days=7)
    daily_expenses_query = db.query(
        Expense.date,
        func.sum(Expense.amount).label("total")
    ).filter(
        Expense.user_id == user_id,
        Expense.date >= seven_days_ago
    ).group_by(Expense.date).order_by(Expense.date).all()

    recent_daily_expenses = [
        DailyExpense(date=str(r.date), total=float(r.total))
        for r in daily_expenses_query
    ]

    return DashboardMetrics(
        total_expenses=float(total_expenses),
        this_month_expenses=float(this_month_expenses),
        active_categories=active_categories,
        budget_used_percentage=round(budget_used_percentage, 1),
        total_budget=float(total_monthly_budget),
        remaining_budget=float(remaining_budget),
        expenses_by_category=expenses_by_category,
        recent_daily_expenses=recent_daily_expenses
    )
