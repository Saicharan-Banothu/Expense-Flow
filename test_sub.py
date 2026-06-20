from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SubscriptionBase(BaseModel):
    name: str
    amount: float
    billing_cycle: str = "monthly"
    next_billing_date: date
    category_id: Optional[int] = None
    is_active: bool = True

class SubscriptionInDBBase(SubscriptionBase):
    id: int
    user_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SubscriptionSchema(SubscriptionInDBBase):
    pass

class SubscriptionModel:
    id = 1
    user_id = 1
    name = "Netflix"
    amount = 200.0
    billing_cycle = "monthly"
    next_billing_date = date.today()
    is_active = 1
    created_at = datetime.now()

    @property
    def category_id(self):
        return None

try:
    s = SubscriptionModel()
    schema = SubscriptionSchema.model_validate(s)
    print(schema)
except Exception as e:
    print(f"ERROR: {e}")
