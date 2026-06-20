from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.budget import Budget
from app.models.user import User
from app.schemas.budget import Budget as BudgetSchema, BudgetCreate, BudgetUpdate

router = APIRouter()

@router.get("/", response_model=List[BudgetSchema])
def read_budgets(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve budgets.
    """
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).offset(skip).limit(limit).all()
    return budgets

@router.post("/", response_model=BudgetSchema)
def create_budget(
    *,
    db: Session = Depends(deps.get_db),
    budget_in: BudgetCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new budget.
    """
    budget = Budget(
        category_id=budget_in.category_id,
        amount=budget_in.amount,
        month=datetime.utcnow().month,
        year=datetime.utcnow().year,
        user_id=current_user.id,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

@router.put("/{id}", response_model=BudgetSchema)
def update_budget(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    budget_in: BudgetUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a budget.
    """
    budget = db.query(Budget).filter(Budget.id == id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    if budget.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = budget_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)
    
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

@router.delete("/{id}", response_model=BudgetSchema)
def delete_budget(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a budget.
    """
    budget = db.query(Budget).filter(Budget.id == id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    if budget.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db.delete(budget)
    db.commit()
    return budget
