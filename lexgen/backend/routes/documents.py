"""
routes/documents.py — Rotas para listagem de tipos de documentos e geração via RAG.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from auth import get_current_user
from models.schemas import GenerateRequest
from services.rag import generate_document, DOCUMENT_TYPE_LABELS
from services.generator import create_docx
from services.qdrant_client import get_collection_info

router = APIRouter()


@router.get("/types")
async def list_document_types(current_user: dict = Depends(get_current_user)):
    """
    Retorna lista de tipos de documentos disponíveis com flag de treinamento.
    """
    types = []

    for slug, label in DOCUMENT_TYPE_LABELS.items():
        info = get_collection_info(slug)
        types.append({
            "slug": slug,
            "label": label,
            "has_training_data": info.get("total_chunks", 0) > 0,
            "total_chunks": info.get("total_chunks", 0),
        })

    return {"types": types}


@router.post("/generate")
async def generate(
    request: GenerateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Gera um documento .docx usando RAG:
    1. Busca chunks similares no Qdrant
    2. Monta o prompt com contexto + dados do formulário
    3. Chama o Ollama para gerar o texto
    4. Cria o .docx formatado
    5. Retorna como download
    """
    if request.document_type not in DOCUMENT_TYPE_LABELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de documento inválido: {request.document_type}",
        )

    if not request.form_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dados do formulário são obrigatórios",
        )

    label = DOCUMENT_TYPE_LABELS[request.document_type]

    try:
        # Gerar texto via RAG
        generated_text = await generate_document(
            document_type=request.document_type,
            form_data=request.form_data,
        )

        # Criar .docx
        docx_bytes = create_docx(generated_text, label)

        # Retornar como download
        filename = f"{request.document_type}_gerado.docx"

        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "X-Generated-Text": "true",
            },
        )

    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except TimeoutError as e:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar documento: {str(e)}",
        )


@router.post("/generate-text")
async def generate_text_only(
    request: GenerateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Gera apenas o texto do documento (sem .docx), para preview no frontend.
    """
    if request.document_type not in DOCUMENT_TYPE_LABELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de documento inválido: {request.document_type}",
        )

    if not request.form_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dados do formulário são obrigatórios",
        )

    try:
        generated_text = await generate_document(
            document_type=request.document_type,
            form_data=request.form_data,
        )

        return {"text": generated_text, "document_type": request.document_type}

    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except TimeoutError as e:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar documento: {str(e)}",
        )


@router.post("/download-docx")
async def download_docx(
    request: dict,
    current_user: dict = Depends(get_current_user),
):
    """
    Recebe o texto (possivelmente editado pelo usuário) e gera o .docx para download.
    """
    text = request.get("text", "")
    document_type = request.get("document_type", "documento")

    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Texto do documento é obrigatório",
        )

    label = DOCUMENT_TYPE_LABELS.get(document_type, "Documento Jurídico")

    try:
        docx_bytes = create_docx(text, label)
        filename = f"{document_type}_gerado.docx"

        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar DOCX: {str(e)}",
        )
