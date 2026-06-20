from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.api import deps
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema, Token
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel

class GoogleLogin(BaseModel):
    token: str

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    elif not user.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified. Please check your inbox.")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user_data = user_in.model_dump(exclude={"password"})
    user_data["hashed_password"] = security.get_password_hash(user_in.password)
    user_data["is_verified"] = False
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    from app.utils.email import send_verification_email
    verification_token = security.create_access_token(
        user.id, expires_delta=timedelta(hours=24)
    )
    send_verification_email(user.email, verification_token)
    
    return user

@router.post("/google", response_model=Token)
def login_google(
    *,
    db: Session = Depends(deps.get_db),
    google_in: GoogleLogin,
) -> Any:
    """
    Login or register via Google
    """
    try:
        client_id = "522375016876-93bc7qup1lprkgkpnt3846defv9fsaav.apps.googleusercontent.com"
        idinfo = id_token.verify_oauth2_token(google_in.token, requests.Request(), client_id)

        email = idinfo['email']
        name = idinfo.get('name', 'Google User')
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            import secrets
            password = secrets.token_urlsafe(32)
            user = User(
                email=email,
                name=name,
                hashed_password=security.get_password_hash(password),
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            if not user.is_verified:
                user.is_verified = True
                db.commit()

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": security.create_access_token(
                user.id, expires_delta=access_token_expires
            ),
            "token_type": "bearer",
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")

class VerifyEmailToken(BaseModel):
    token: str

@router.post("/verify-email")
def verify_email(
    *,
    db: Session = Depends(deps.get_db),
    verify_in: VerifyEmailToken,
) -> Any:
    """
    Verify email address.
    """
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(
            verify_in.token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = payload.get("sub")
        if token_data is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    user = db.query(User).filter(User.id == int(token_data)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_verified = True
    db.add(user)
    db.commit()
    return {"message": "Email verified successfully"}

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update current user details and password.
    """
    if user_in.email is not None and user_in.email != current_user.email:
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
        current_user.email = user_in.email
    
    if user_in.name is not None:
        current_user.name = user_in.name
        
    if user_in.password is not None and len(user_in.password) > 0:
        current_user.hashed_password = security.get_password_hash(user_in.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
