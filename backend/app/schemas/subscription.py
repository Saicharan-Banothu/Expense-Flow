from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class SubscriptionBase(BaseModel):
    name: str
    amount: float
    billing_cycle: str = "monthly"
    next_billing_date: date
    category_id: Optional[int] = None
    is_active: bool = True

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    billing_cycle: Optional[str] = None
    next_billing_date: Optional[date] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None

class SubscriptionInDBBase(SubscriptionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Subscription(SubscriptionInDBBase):
    pass
