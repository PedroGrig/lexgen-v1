"""
routes/auth.py — Rota de autenticação (login).
"""

from fastapi import APIRouter, HTTPException, status
from models.schemas import LoginRequest, LoginResponse
from auth import authenticate_user, create_access_token

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Autentica o usuário e retorna um token JWT."""
    user = authenticate_user(request.username, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos",
        )

    token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}
    )

    return LoginResponse(
        access_token=token,
        role=user["role"],
        username=user["username"],
    )
