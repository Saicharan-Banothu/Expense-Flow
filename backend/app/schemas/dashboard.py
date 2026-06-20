from pydantic import BaseModel
from typing import List

class CategoryExpense(BaseModel):
    name: str
    color: str
    total: float

class DailyExpense(BaseModel):
    date: str
    total: float

class DashboardMetrics(BaseModel):
    total_expenses: float
    this_month_expenses: float
    active_categories: int
    budget_used_percentage: float
    expenses_by_category: List[CategoryExpense]
    recent_daily_expenses: List[DailyExpense]
