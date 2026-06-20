from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class SavingGoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[date] = None

class SavingGoalCreate(SavingGoalBase):
    pass

class SavingGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[date] = None

class SavingGoalInDBBase(SavingGoalBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SavingGoal(SavingGoalInDBBase):
    pass
