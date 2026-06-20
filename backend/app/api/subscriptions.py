from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.budget import Subscription
from app.models.user import User
from app.schemas.subscription import Subscription as SubscriptionSchema, SubscriptionCreate, SubscriptionUpdate
from app.models.expense import Expense, Category
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[SubscriptionSchema])
def read_subscriptions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve subscriptions.
    """
    subscriptions = db.query(Subscription).filter(Subscription.user_id == current_user.id).offset(skip).limit(limit).all()
    return subscriptions

@router.post("/", response_model=SubscriptionSchema)
def create_subscription(
    *,
    db: Session = Depends(deps.get_db),
    subscription_in: SubscriptionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new subscription.
    """
    if subscription_in.next_billing_date.month != datetime.today().month or subscription_in.next_billing_date.year != datetime.today().year:
        raise HTTPException(status_code=400, detail="Subscription date must be in the current month.")

    subscription = Subscription(
        name=subscription_in.name,
        amount=subscription_in.amount,
        billing_cycle=subscription_in.billing_cycle,
        next_billing_date=subscription_in.next_billing_date,
        is_active=1 if subscription_in.is_active else 0,
        user_id=current_user.id,
    )
    db.add(subscription)
    
    # Ensure category_id is valid for Expense
    category_id = subscription_in.category_id if hasattr(subscription_in, 'category_id') and subscription_in.category_id else None
    if not category_id:
        uncategorized = db.query(Category).filter(
            Category.user_id == current_user.id,
            Category.name == "Uncategorized"
        ).first()
        if not uncategorized:
            uncategorized = Category(
                name="Uncategorized", 
                user_id=current_user.id, 
                icon="help-circle", 
                color="#94a3b8"
            )
            db.add(uncategorized)
            db.commit()
            db.refresh(uncategorized)
        category_id = uncategorized.id

    # Automatically log it as an expense for the current month
    expense = Expense(
        amount=subscription_in.amount,
        title=f"Subscription: {subscription_in.name}",
        date=subscription_in.next_billing_date,
        user_id=current_user.id,
        category_id=category_id
    )
    db.add(expense)
    
    db.commit()
    db.refresh(subscription)
    return subscription

@router.put("/{id}", response_model=SubscriptionSchema)
def update_subscription(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    subscription_in: SubscriptionUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a subscription.
    """
    subscription = db.query(Subscription).filter(Subscription.id == id).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = subscription_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subscription, field, value)
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription

@router.delete("/{id}", response_model=SubscriptionSchema)
def delete_subscription(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a subscription.
    """
    subscription = db.query(Subscription).filter(Subscription.id == id).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db.delete(subscription)
    db.commit()
    return subscription
