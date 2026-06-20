from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.budget import SavingGoal
from app.models.user import User
from app.schemas.saving_goal import SavingGoal as SavingGoalSchema, SavingGoalCreate, SavingGoalUpdate

router = APIRouter()

@router.get("/", response_model=List[SavingGoalSchema])
def read_saving_goals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve saving goals.
    """
    goals = db.query(SavingGoal).filter(SavingGoal.user_id == current_user.id).offset(skip).limit(limit).all()
    return goals

@router.post("/", response_model=SavingGoalSchema)
def create_saving_goal(
    *,
    db: Session = Depends(deps.get_db),
    goal_in: SavingGoalCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new saving goal.
    """
    goal = SavingGoal(
        name=goal_in.name,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount,
        target_date=goal_in.target_date,
        user_id=current_user.id,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.put("/{id}", response_model=SavingGoalSchema)
def update_saving_goal(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    goal_in: SavingGoalUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a saving goal.
    """
    goal = db.query(SavingGoal).filter(SavingGoal.id == id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Saving goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = goal_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
    
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{id}", response_model=SavingGoalSchema)
def delete_saving_goal(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a saving goal.
    """
    goal = db.query(SavingGoal).filter(SavingGoal.id == id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Saving goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db.delete(goal)
    db.commit()
    return goal
