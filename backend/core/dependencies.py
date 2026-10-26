from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User
from core.security import get_token_data


# ==========================================================
# OAuth2 Scheme
# ==========================================================

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ==========================================================
# Get Current User
# ==========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Validate JWT and return the authenticated user.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token_data = get_token_data(token)
    except JWTError:
        raise credentials_exception

    user = (
        db.query(User)
        .filter(User.id == token_data["user_id"])
        .first()
    )

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive."
        )

    return user


# ==========================================================
# Admin Dependency
# ==========================================================

def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Allow access only to Admin users.
    """

    if current_user.role.role_name != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )

    return current_user


# ==========================================================
# Cashier Dependency
# ==========================================================

def get_current_cashier(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Allow access only to Cashier users.
    """

    if current_user.role.role_name != "CASHIER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cashier access required."
        )

    return current_user


# ==========================================================
# Customer Dependency
# ==========================================================

def get_current_customer(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Allow access only to Customer users.
    """

    if current_user.role.role_name != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access required."
        )

    return current_user


# ==========================================================
# Admin or Cashier
# ==========================================================

def get_admin_or_cashier(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Allow access to Admin and Cashier users.
    """

    allowed_roles = {"ADMIN", "CASHIER"}

    if current_user.role.role_name not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Cashier access required."
        )

    return current_user