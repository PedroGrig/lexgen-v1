from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes import auth as auth_routes
from routes import admin as admin_routes
from routes import documents as document_routes

load_dotenv()

app = FastAPI(
    title="LexGen API",
    description="API para geração inteligente de documentos jurídicos trabalhistas",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth_routes.router, prefix="/auth", tags=["Autenticação"])
app.include_router(admin_routes.router, prefix="/admin", tags=["Admin"])
app.include_router(document_routes.router, prefix="/documents", tags=["Documentos"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "LexGen API"}
