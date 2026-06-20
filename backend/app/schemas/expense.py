from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ExpenseBase(BaseModel):
    amount: float
    description: str
    date: date
    category_id: Optional[int] = None
    is_recurring: bool = False

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date] = None
    category_id: Optional[int] = None
    is_recurring: Optional[bool] = None

class ExpenseInDBBase(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Expense(ExpenseInDBBase):
    pass
