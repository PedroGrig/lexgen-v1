"""
rag.py — Pipeline RAG: monta query, busca similares no Qdrant,
gera prompt e chama o Ollama para gerar o documento.
"""

import os
import httpx
from typing import Dict, Any

from services.qdrant_client import search_similar

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "localhost")
OLLAMA_PORT = os.getenv("OLLAMA_PORT", "11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

# Labels para cada tipo de documento
DOCUMENT_TYPE_LABELS = {
    "peticao_inicial": "Reclamação Trabalhista (Rito Ordinário)",
    "peticao_inicial_sumarissimo": "Reclamação Trabalhista (Rito Sumaríssimo)",
    "contestacao": "Contestação",
    "replica_contestacao": "Réplica à Contestação",
    "alegacoes_finais": "Alegações Finais / Memorial",
    "recurso_ordinario": "Recurso Ordinário",
    "recurso_revista": "Recurso de Revista",
    "agravo_instrumento": "Agravo de Instrumento",
    "agravo_regimental": "Agravo Regimental",
    "embargos_declaracao": "Embargos de Declaração",
    "embargos_execucao": "Embargos à Execução",
    "execucao_sentenca": "Petição de Execução de Sentença",
    "impugnacao_calculos": "Impugnação aos Cálculos de Liquidação",
    "impugnacao_sentenca_liquidacao": "Impugnação à Sentença de Liquidação",
    "tutela_urgencia": "Pedido de Tutela de Urgência",
    "mandado_seguranca": "Mandado de Segurança Trabalhista",
    "acao_rescisoria": "Ação Rescisória Trabalhista",
    "acordo_judicial": "Petição de Acordo Judicial",
    "acordo_extrajudicial": "Acordo Extrajudicial (art. 855-B CLT)",
    "peticao_avulsa": "Petição Avulsa / Intermediária",
    "peticao_diligencia": "Petição de Diligência",
    "excecao_incompetencia": "Exceção de Incompetência",
    "notificacao_extrajudicial": "Notificação Extrajudicial",
    "carta_preposicao": "Carta de Preposição",
    "procuracao": "Procuração (Ad Judicia)",
    "substabelecimento": "Substabelecimento",
    "contrato_honorarios": "Contrato de Honorários Advocatícios",
}


def build_search_query(document_type: str, form_data: Dict[str, Any]) -> str:
    """Monta uma query de busca a partir dos dados do formulário."""
    label = DOCUMENT_TYPE_LABELS.get(document_type, document_type)
    parts = [f"Documento: {label}"]

    # Inclui os campos mais relevantes na query
    priority_fields = [
        "descricao_fatos", "razoes_recurso", "motivo_rescisao",
        "objeto", "fundamentacao", "pedidos", "argumentacao",
        "reclamante_nome", "reclamado_razao_social",
    ]

    for field in priority_fields:
        if field in form_data and form_data[field]:
            parts.append(str(form_data[field])[:200])

    # Pega os primeiros campos texto que não são os prioritários
    for key, value in form_data.items():
        if key not in priority_fields and isinstance(value, str) and len(value) > 20:
            parts.append(str(value)[:200])
            if len(parts) >= 5:
                break

    return " ".join(parts)[:1000]


def format_form_data(form_data: Dict[str, Any]) -> str:
    """Formata os dados do formulário para inclusão no prompt."""
    lines = []
    for key, value in form_data.items():
        if value:
            # Converte o id do campo para um label legível
            label = key.replace("_", " ").title()
            lines.append(f"- {label}: {value}")
    return "\n".join(lines)


def build_prompt(
    document_type: str,
    form_data: Dict[str, Any],
    retrieved_chunks: list[str],
) -> str:
    """Monta o prompt completo para o LLM."""
    label = DOCUMENT_TYPE_LABELS.get(document_type, document_type)
    form_data_formatted = format_form_data(form_data)

    chunks_text = ""
    if retrieved_chunks:
        chunks_text = "\n---\n".join(retrieved_chunks)
        examples_section = f"""
EXEMPLOS DE DOCUMENTOS REAIS DO ESCRITÓRIO (use como referência de estilo, estrutura e fundamentação):
---
{chunks_text}
---
"""
    else:
        examples_section = """
NOTA: Não há documentos de referência disponíveis. Redija o documento usando seu conhecimento jurídico e as melhores práticas da área trabalhista brasileira.
"""

    prompt = f"""Você é um advogado trabalhista experiente brasileiro. Sua tarefa é redigir um(a) {label} completo(a) e juridicamente preciso(a) em português do Brasil.

{examples_section}

DADOS DO CASO:
{form_data_formatted}

INSTRUÇÕES:
- Redija o documento completo, seguindo a estrutura padrão de uma {label} trabalhista brasileira
- Use linguagem jurídica formal e precisa
- Cite artigos da CLT e súmulas do TST relevantes
- Adapte os argumentos especificamente aos dados fornecidos
- Inclua todos os pedidos pertinentes
- Formate com endereçamento, qualificação das partes, dos fatos, do direito, dos pedidos e fecho

Redija agora o documento completo:"""

    return prompt


async def call_ollama(prompt: str) -> str:
    """Chama a API do Ollama para gerar texto."""
    url = f"http://{OLLAMA_HOST}:{OLLAMA_PORT}/api/generate"

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 4096,
        },
    }

    async with httpx.AsyncClient(timeout=300.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
        except httpx.ConnectError:
            raise ConnectionError(
                "Não foi possível conectar ao Ollama. "
                "Verifique se o serviço está rodando e o modelo está instalado. "
                f"Tentou conectar em: {url}"
            )
        except httpx.TimeoutException:
            raise TimeoutError(
                "O Ollama demorou muito para responder. "
                "Isso pode ocorrer se o modelo ainda está carregando."
            )
        except httpx.HTTPStatusError as e:
            raise RuntimeError(
                f"Erro do Ollama (HTTP {e.response.status_code}): {e.response.text}"
            )


async def generate_document(document_type: str, form_data: Dict[str, Any]) -> str:
    """
    Pipeline RAG completo:
    1. Monta query de busca com os dados do formulário
    2. Busca chunks similares no Qdrant
    3. Monta prompt estruturado
    4. Chama o Ollama
    5. Retorna o texto gerado
    """
    # 1. Monta a query de busca
    search_query = build_search_query(document_type, form_data)

    # 2. Busca chunks similares
    retrieved_chunks = search_similar(document_type, search_query, top_k=5)

    # 3. Monta o prompt
    prompt = build_prompt(document_type, form_data, retrieved_chunks)

    # 4. Chama o Ollama
    generated_text = await call_ollama(prompt)

    if not generated_text or not generated_text.strip():
        raise RuntimeError(
            "O modelo não gerou conteúdo. "
            "Tente novamente ou verifique se o modelo está carregado."
        )

    return generated_text
