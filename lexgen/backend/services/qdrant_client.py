"""
qdrant_client.py — Gerencia conexão com o Qdrant, criação de collections,
upsert de vetores e busca por similaridade.
"""

import os
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime

from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from sentence_transformers import SentenceTransformer

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))

# Modelo de embeddings multilingual — dimensão 384
EMBEDDING_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
VECTOR_SIZE = 384

# Singletons
_client: Optional[QdrantClient] = None
_embedding_model: Optional[SentenceTransformer] = None


def get_client() -> QdrantClient:
    """Retorna instância singleton do QdrantClient."""
    global _client
    if _client is None:
        _client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
    return _client


def get_embedding_model() -> SentenceTransformer:
    """Retorna instância singleton do modelo de embeddings."""
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _embedding_model


def ensure_collection(document_type: str) -> None:
    """Cria a collection no Qdrant se não existir."""
    client = get_client()
    collection_name = f"lexgen_{document_type}"

    collections = client.get_collections().collections
    existing_names = [c.name for c in collections]

    if collection_name not in existing_names:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=qdrant_models.VectorParams(
                size=VECTOR_SIZE,
                distance=qdrant_models.Distance.COSINE,
            ),
        )


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Gera embeddings para uma lista de textos."""
    model = get_embedding_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    return embeddings.tolist()


def upsert_chunks(
    document_type: str,
    chunks: List[str],
    metadata: Dict[str, Any],
) -> int:
    """
    Insere chunks vetorizados no Qdrant.
    Retorna o número de pontos inseridos.
    """
    if not chunks:
        return 0

    client = get_client()
    collection_name = f"lexgen_{document_type}"
    ensure_collection(document_type)

    embeddings = embed_texts(chunks)

    points = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        point_id = str(uuid.uuid4())
        payload = {
            "text": chunk,
            "document_type": document_type,
            "chunk_index": i,
            "filename": metadata.get("filename", "unknown"),
            "uploaded_at": metadata.get("uploaded_at", datetime.utcnow().isoformat()),
        }
        points.append(
            qdrant_models.PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload,
            )
        )

    # Upsert em batches de 100
    batch_size = 100
    for i in range(0, len(points), batch_size):
        batch = points[i : i + batch_size]
        client.upsert(collection_name=collection_name, points=batch)

    return len(points)


def search_similar(
    document_type: str, query: str, top_k: int = 5
) -> List[str]:
    """
    Busca os chunks mais similares à query no Qdrant.
    Retorna lista de textos dos chunks encontrados.
    """
    client = get_client()
    collection_name = f"lexgen_{document_type}"

    # Verifica se a collection existe
    collections = client.get_collections().collections
    existing_names = [c.name for c in collections]
    if collection_name not in existing_names:
        return []

    query_embedding = embed_texts([query])[0]

    results = client.search(
        collection_name=collection_name,
        query_vector=query_embedding,
        limit=top_k,
    )

    return [hit.payload.get("text", "") for hit in results if hit.payload]


def get_collection_info(document_type: str) -> Dict[str, Any]:
    """Retorna informações sobre a collection de um tipo de documento."""
    client = get_client()
    collection_name = f"lexgen_{document_type}"

    collections = client.get_collections().collections
    existing_names = [c.name for c in collections]

    if collection_name not in existing_names:
        return {"exists": False, "total_chunks": 0, "total_documents": 0}

    info = client.get_collection(collection_name=collection_name)
    total_chunks = info.points_count or 0

    # Estimar número de documentos distintos
    total_documents = 0
    if total_chunks > 0:
        try:
            # Scroll para obter filenames únicos
            records, _ = client.scroll(
                collection_name=collection_name,
                limit=1000,
                with_payload=True,
                with_vectors=False,
            )
            filenames = set()
            for record in records:
                if record.payload and "filename" in record.payload:
                    filenames.add(record.payload["filename"])
            total_documents = len(filenames)
        except Exception:
            total_documents = 1 if total_chunks > 0 else 0

    # Obter data do último upload
    last_upload = None
    if total_chunks > 0:
        try:
            records, _ = client.scroll(
                collection_name=collection_name,
                limit=1,
                with_payload=True,
                with_vectors=False,
            )
            if records and records[0].payload:
                last_upload = records[0].payload.get("uploaded_at")
        except Exception:
            pass

    return {
        "exists": True,
        "total_chunks": total_chunks,
        "total_documents": total_documents,
        "last_upload": last_upload,
    }


def delete_collection(document_type: str) -> bool:
    """Remove a collection inteira de um tipo de documento."""
    client = get_client()
    collection_name = f"lexgen_{document_type}"

    collections = client.get_collections().collections
    existing_names = [c.name for c in collections]

    if collection_name in existing_names:
        client.delete_collection(collection_name=collection_name)
        return True
    return False


def get_all_documents_info(document_type: str) -> List[Dict[str, Any]]:
    """Retorna informações sobre todos os documentos indexados para um tipo."""
    client = get_client()
    collection_name = f"lexgen_{document_type}"

    collections = client.get_collections().collections
    existing_names = [c.name for c in collections]

    if collection_name not in existing_names:
        return []

    try:
        records, _ = client.scroll(
            collection_name=collection_name,
            limit=10000,
            with_payload=True,
            with_vectors=False,
        )

        # Agrupar por filename
        docs: Dict[str, Dict[str, Any]] = {}
        for record in records:
            if not record.payload:
                continue
            filename = record.payload.get("filename", "unknown")
            if filename not in docs:
                docs[filename] = {
                    "filename": filename,
                    "document_type": document_type,
                    "uploaded_at": record.payload.get("uploaded_at"),
                    "chunks_count": 0,
                }
            docs[filename]["chunks_count"] += 1

        return list(docs.values())
    except Exception:
        return []
