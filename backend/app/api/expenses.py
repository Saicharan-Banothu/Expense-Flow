from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.expense import Expense, Category
from app.models.user import User
from app.schemas.expense import Expense as ExpenseSchema, ExpenseCreate, ExpenseUpdate

router = APIRouter()

@router.get("/", response_model=List[ExpenseSchema])
def read_expenses(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve expenses.
    """
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).order_by(Expense.date.desc()).offset(skip).limit(limit).all()
    return expenses

@router.post("/", response_model=ExpenseSchema)
def create_expense(
    *,
    db: Session = Depends(deps.get_db),
    expense_in: ExpenseCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new expense.
    """
    from datetime import datetime

    today = datetime.today().date()
    if expense_in.date.year != today.year or expense_in.date.month != today.month:
        raise HTTPException(status_code=400, detail="Expense date must be within the current month and year.")

    category_id = expense_in.category_id
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

    expense = Expense(
        amount=expense_in.amount,
        title=expense_in.description,
        date=expense_in.date,
        category_id=category_id,
        user_id=current_user.id,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.put("/{id}", response_model=ExpenseSchema)
def update_expense(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    expense_in: ExpenseUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an expense.
    """
    expense = db.query(Expense).filter(Expense.id == id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = expense_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
    
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{id}", response_model=ExpenseSchema)
def delete_expense(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an expense.
    """
    expense = db.query(Expense).filter(Expense.id == id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if expense.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db.delete(expense)
    db.commit()
    return expense
