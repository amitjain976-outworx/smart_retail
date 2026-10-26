from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from db.models import User, Role
from db.schemas import (
    LoginRequest,
    LoginResponse,
    UserCreate,
    UserResponse,
    MessageResponse,
    RoleResponse,
)
from core.security import (
    verify_password,
    hash_password,
    create_user_token,
)
from core.dependencies import (
    get_current_user,
    get_current_admin,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ==========================================================
# LOGIN
# ==========================================================

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticate user and return JWT token.
    """

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    if not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_user_token(
        user_id=user.id,
        email=user.email,
        role=user.role.role_name,
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role.role_name,
    )


# ==========================================================
# CURRENT USER
# ==========================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Return currently logged-in user.
    """

    return current_user


# ==========================================================
# REGISTER USER (ADMIN ONLY)
# ==========================================================

@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    request: UserCreate,
    db: Session = Depends(get_db),
    # _: User = Depends(get_current_admin),
):
    """
    Create a new user.
    Only Admin can create users.
    """

    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists.",
        )

    role = (
        db.query(Role)
        .filter(Role.id == request.role_id)
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found.",
        )

    new_user = User(
        role_id=request.role_id,
        full_name=request.full_name,
        email=request.email,
        password_hash=hash_password(
            request.password
        ),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return MessageResponse(
        message="User created successfully."
    )


@router.get(
    "/roles",
    response_model=List[RoleResponse]
)
def get_roles(
    db: Session = Depends(get_db),
):
    return db.query(Role).all()

