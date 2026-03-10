import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "default_secret_change_me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=JWT_EXPIRATION_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        )


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return decode_token(credentials.credentials)


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    return current_user


def authenticate_user(username: str, password: str) -> Optional[dict]:
    admin_user = os.getenv("ADMIN_USER", "admin")
    admin_pass = os.getenv("ADMIN_PASS", "admin")
    user_pass = os.getenv("USER_PASS", "user")

    if username == admin_user and password == admin_pass:
        return {"username": username, "role": "admin"}

    # Qualquer outro username com a senha de usuário é autenticado como 'user'
    if password == user_pass:
        return {"username": username, "role": "user"}

    return None
