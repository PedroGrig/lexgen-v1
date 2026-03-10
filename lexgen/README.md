# LexGen — Geração Inteligente de Documentos Jurídicos

LexGen é uma plataforma RAG (Retrieval-Augmented Generation) projetada para escritórios de advocacia. Permite o upload de peças reais do escritório para treinar o modelo, e posteriormente a geração de novos documentos formatados com base nesse conhecimento, usando IA local (`Ollama` + `qwen2.5:3b`) e um banco vetorial (`Qdrant`).

## 🛠️ Stack Tecnológica

**Backend**: Python 3.11, FastAPI, Qdrant, Ollama, sentence-transformers, python-docx, PyMuPDF, JWT Authentication.
**Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui.
**Infra**: Docker Compose (compatível com VPS / Coolify).

## 🚀 Como Subir o Sistema (Local ou VPS)

### 1. Requisitos
- Docker e Docker Compose instalados
- Aproximadamente 20GB livres em disco (para as imagens e o modelo do Ollama)

### 2. Configurando o Ambiente
Copie o arquivo `.env.example` para `.env` e configure suas senhas:
```bash
cp .env.example .env
```
No arquivo `.env`, altere as senhas conforme necessário:
- `ADMIN_USER` e `ADMIN_PASS`: Credenciais para acessar o painel de treinamento do RAG.
- `USER_PASS`: Qualquer outro nome de usuário que tentar logar usando esta senha entrará como Usuário comum (advogado/estagiário).

### 3. Subindo os Containers
Na raiz do projeto, execute:
```bash
docker compose up -d --build
```
Isso fará o build do backend e frontend, e fará o pull das imagens do Qdrant e do Ollama.

### 4. Baixando o Modelo de IA (Obrigatório)
Após os containers estarem rodando, você **precisa** baixar o modelo Qwen 2.5 no container do Ollama:
```bash
docker exec -it lexgen-ollama ollama pull qwen2.5:3b
```
Aguarde o download finalizar (são cerca de 4.7GB). Sem isso, o sistema não conseguirá gerar documentos.

### 5. Acessando a Aplicação
- **Frontend / Interface**: [http://localhost:3000](http://localhost:3000)
- **Backend / API**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

---

## 🔒 Perfis de Uso

1. **Administrador** (Login: `admin` / senha configurada no `.env`):
   - Acesso ao painel `/admin`
   - Faz upload de documentos reais do escritório (`.docx` ou `.pdf`) e seleciona a categoria
   - O sistema extrai o texto, quebra em partes (chunks) e envia para o Qdrant (treinamento)
   - Pode visualizar a biblioteca e resetar o treinamento de categorias

2. **Usuário Comum** (Qualquer login / senha de usuário no `.env`):
   - Acesso ao painel `/dashboard`
   - Vê apenas as categorias que já receberam dados de treinamento (as outras ficam desabilitadas)
   - Preenche o formulário da categoria escolhida
   - O sistema busca os trechos mais parecidos no banco vetorial, envia para o LLM junto com os dados do caso, e gera o documento editável e baixável em `.docx` formatado ABNT.

---

## 🗂️ Categorias de Documentos Suportadas
O sistema suporta 24 categorias nativas, divididas em:
- Peças Principais (Inicial, Contestação, Alegações)
- Recursos (Ordinário, Revista, Agravos, Embargos)
- Execução e Liquidação
- Tutelas / Medidas de Urgência
- Documentos Extrajudiciais e Acordos

Todo o Schema e designação de variáveis é estático no código (`document-schemas.ts`).
