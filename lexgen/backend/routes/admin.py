"""
routes/admin.py — Rotas administrativas: listagem de categorias, upload e treinamento,
biblioteca de documentos, reset de treinamento.
"""

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from auth import require_admin
from models.schemas import CategoryInfo, UploadResponse
from services.parser import extract_text, chunk_text
from services.qdrant_client import (
    upsert_chunks,
    get_collection_info,
    delete_collection,
    get_all_documents_info,
)
from services.rag import DOCUMENT_TYPE_LABELS

router = APIRouter()


@router.get("/categories", response_model=List[CategoryInfo])
async def list_categories(current_user: dict = Depends(require_admin)):
    """Lista todas as 24 categorias com informações de treinamento."""
    categories = []

    for slug, label in DOCUMENT_TYPE_LABELS.items():
        info = get_collection_info(slug)
        categories.append(
            CategoryInfo(
                slug=slug,
                label=label,
                total_chunks=info.get("total_chunks", 0),
                total_documents=info.get("total_documents", 0),
                last_upload=info.get("last_upload"),
            )
        )

    return categories


@router.post("/upload", response_model=UploadResponse)
async def upload_documents(
    files: List[UploadFile] = File(...),
    document_type: str = Form(...),
    current_user: dict = Depends(require_admin),
):
    """
    Recebe arquivos .docx e .pdf, extrai texto, divide em chunks,
    gera embeddings e insere no Qdrant.
    """
    if document_type not in DOCUMENT_TYPE_LABELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de documento inválido: {document_type}",
        )

    total_processed = 0
    total_chunks = 0

    for file in files:
        # Validar tipo de arquivo
        if not file.filename:
            continue

        lower_name = file.filename.lower()
        if not (lower_name.endswith(".docx") or lower_name.endswith(".pdf")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato não suportado: {file.filename}. Use .docx ou .pdf",
            )

        # Ler bytes do arquivo
        file_bytes = await file.read()

        if not file_bytes:
            continue

        try:
            # Extrair texto
            text = extract_text(file_bytes, file.filename)

            if not text or not text.strip():
                continue

            # Dividir em chunks
            chunks = chunk_text(text, chunk_size=800, overlap=100)

            if not chunks:
                continue

            # Inserir no Qdrant
            metadata = {
                "filename": file.filename,
                "uploaded_at": datetime.utcnow().isoformat(),
            }
            inserted = upsert_chunks(document_type, chunks, metadata)

            total_processed += 1
            total_chunks += inserted

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao processar {file.filename}: {str(e)}",
            )

    return UploadResponse(
        processed=total_processed,
        chunks_created=total_chunks,
        document_type=document_type,
    )


@router.delete("/category/{document_type}")
async def delete_category(
    document_type: str,
    current_user: dict = Depends(require_admin),
):
    """Remove todos os vetores de uma categoria (reset do treinamento)."""
    if document_type not in DOCUMENT_TYPE_LABELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de documento inválido: {document_type}",
        )

    deleted = delete_collection(document_type)

    return {
        "success": True,
        "message": f"Treinamento de '{DOCUMENT_TYPE_LABELS[document_type]}' resetado com sucesso"
        if deleted
        else "Nenhum dado encontrado para resetar",
        "document_type": document_type,
    }


@router.get("/library")
async def get_library(
    document_type: str = None,
    current_user: dict = Depends(require_admin),
):
    """Retorna todos os documentos indexados, com filtro opcional por categoria."""
    all_docs = []

    if document_type:
        if document_type not in DOCUMENT_TYPE_LABELS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de documento inválido: {document_type}",
            )
        docs = get_all_documents_info(document_type)
        for doc in docs:
            doc["label"] = DOCUMENT_TYPE_LABELS.get(document_type, document_type)
        all_docs.extend(docs)
    else:
        for slug in DOCUMENT_TYPE_LABELS:
            docs = get_all_documents_info(slug)
            for doc in docs:
                doc["label"] = DOCUMENT_TYPE_LABELS.get(slug, slug)
            all_docs.extend(docs)

    return {"documents": all_docs, "total": len(all_docs)}
