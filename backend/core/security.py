from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import os
from dotenv import load_dotenv
from jose import JWTError, jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError

load_dotenv()

# ==========================================================
# JWT CONFIGURATION
# ==========================================================

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is missing in .env file.")


# ==========================================================
# ARGON2 PASSWORD HASHER
# ==========================================================

password_hasher = PasswordHasher()


# ==========================================================
# PASSWORD UTILITIES
# ==========================================================

def hash_password(password: str) -> str:
    """
    Hash a plain-text password using Argon2.
    """
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against an Argon2 hash.
    """
    try:
        return password_hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError):
        return False


# ==========================================================
# JWT UTILITIES
# ==========================================================

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a signed JWT access token.
    """

    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc) + expires_delta
        if expires_delta
        else datetime.now(timezone.utc)
        + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT.
    Raises JWTError if invalid or expired.
    """

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
    )

    return payload


# ==========================================================
# TOKEN HELPERS
# ==========================================================

def create_user_token(
    *,
    user_id: int,
    email: str,
    role: str,
) -> str:
    """
    Create an access token for a logged-in user.
    """

    return create_access_token(
        {
            "sub": str(user_id),
            "email": email,
            "role": role,
        }
    )


def get_token_data(token: str) -> Dict[str, Any]:
    """
    Decode token and return useful user information.
    """

    payload = decode_access_token(token)

    return {
        "user_id": int(payload["sub"]),
        "email": payload["email"],
        "role": payload["role"],
    }


# ==========================================================
# OPTIONAL PASSWORD STRENGTH CHECK
# ==========================================================

def validate_password_strength(password: str) -> bool:
    """
    Basic password validation.

    Requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    """

    if len(password) < 8:
        return False

    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)

    return has_upper and has_lower and has_digit