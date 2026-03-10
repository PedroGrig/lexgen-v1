"""
parser.py — Extrai texto de .docx e .pdf e divide em chunks para indexação.
"""

from typing import List
import io
import docx
import fitz  # PyMuPDF


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extrai todo o texto de um arquivo .docx."""
    doc = docx.Document(io.BytesIO(file_bytes))
    full_text = []
    for paragraph in doc.paragraphs:
        text = paragraph.text.strip()
        if text:
            full_text.append(text)
    return "\n".join(full_text)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extrai todo o texto de um arquivo .pdf usando PyMuPDF."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = []
    for page in doc:
        text = page.get_text().strip()
        if text:
            full_text.append(text)
    doc.close()
    return "\n".join(full_text)


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """
    Divide o texto em chunks de tamanho aproximado chunk_size,
    com overlap entre chunks consecutivos.
    """
    if not text or not text.strip():
        return []

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size

        # Se não estamos no final, tenta quebrar em um espaço ou quebra de linha
        if end < text_length:
            # Procura o último espaço ou quebra de linha dentro do chunk
            break_point = text.rfind("\n", start, end)
            if break_point == -1 or break_point <= start:
                break_point = text.rfind(" ", start, end)
            if break_point > start:
                end = break_point

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Avança com overlap
        start = end - overlap if end < text_length else text_length

    return chunks


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Extrai texto baseado na extensão do arquivo."""
    lower_name = filename.lower()
    if lower_name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    elif lower_name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    else:
        raise ValueError(f"Formato de arquivo não suportado: {filename}")
