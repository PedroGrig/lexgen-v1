# 🚀 Tutorial Definitivo: Como colocar o LexGen no Ar no Coolify (Para Iniciantes)

Este tutorial foi feito passo-a-passo. Siga exatamente a ordem abaixo sem pular nada.

Se você está com medo de quebrar os seus outros sistemas (Supabase, n8n, etc), fique tranquilo. Usar o Coolify de forma correta impede que as coisas se misturem. 

---

## 🛑 PASSO 1: Verificando a Memória da sua VPS (MUITO IMPORTANTE)

Como seu servidor já tem muita coisa rodando, precisamos ter certeza de que cabe a nossa Inteligência Artificial (mesmo o modelo `qwen2.5:3b` que é bem leve, ainda usa RAM).

1. Abra o painel da empresa onde você alugou o servidor (ex: Hetzner, DigitalOcean) ou o programa que você usa para acessar o "Terminal Preto" do seu servidor.
2. Digite este comando e aperte **Enter**:
   ```bash
   free -h
   ```
3. Vai aparecer uma tabelinha. Olhe a linha **Mem** e a coluna **Available** (ou *Livre*). 
4. **Regra de ouro:** Se você tiver menos que `4.0G` ali, o seu servidor vai travar e o n8n ou Supabase podem cair. Se isso acontecer, você precisará ir no painel da sua hospedagem e dar um *Upgrade* no plano do servidor para colocar mais memória antes de continuar. Se tiver `4.0G` ou mais livre, pode seguir pro Passo 2.

---

## 📂 PASSO 2: Colocando o Código no GitHub

O Coolify precisa de um repositório no GitHub para "puxar" os arquivos.

1. Acesse **[github.com](https://github.com/)** e faça login (crie uma conta se não tiver).
2. No canto superior esquerdo ou direito, clique em **New** (Novo Repositório).
3. Em "Repository name", digite `lexgen`.
4. Marque a bolinha **Private** (Privado) para ninguém roubar o seu código.
5. Clique no botão verde lá embaixo: **Create repository**.
6. Agora, pegue **todas as pastas e arquivos** deste projeto que eu te entreguei (a pasta `backend`, pasta `frontend`, arquivo `docker-compose.yml`, etc.) e suba tudo para esse repositório do GitHub. Você pode fazer isso arrastando os arquivos direto para a aba do GitHub no seu navegador se ele permitir, ou pelo VS Code.
   * *Certifique-se de que o arquivo `docker-compose.yml` está na raiz (na tela principal do seu repositório no Github), e não dentro de pastas.*

---

## 🌐 PASSO 3: Criando o Projeto dentro do Coolify

Agora vamos pegar o código do Github e ligar no seu Servidor.

1. Abra o seu painel do **Coolify**.
2. No canto esquerdo, clique em **Projects** e escolha o seu projeto atual (provavelmente se chama `production` ou algo assim).
3. Lá no topo da tela, clique no botão pequeno escrito **`+ New`** (Novo Recurso).
4. Vai abrir uma gaveta ou janela com várias opções. Clique na opção **Docker Compose**.
5. Ele vai perguntar de onde quer pegar o arquivo. Clique em **Git Repository**.
6. Ele vai pedir a fonte (Source). Selecione o seu Github. 
7. Encontre o repositório `lexgen` que você acabou de criar no passo anterior. Selecione a branch `main` (ou master) e confirme.
8. Uma tela vai se abrir com as configurações. No campo **"Compose File"**, pode deixar como `docker-compose.yml` e o **"Base Directory"** como `/` (que significa as configurações padrão da raiz).
9. Clique para salvar. Vai aparecer um monte de caixinhas para você na tela.

---

## 🔒 PASSO 4: Preenchendo as Senhas (Variáveis de Ambiente)

Essa é a parte crucial de segurança.

1. Ainda nessa tela do Coolify, ache a barra lateral ou a aba superior chamada **Environment Variables** (ou Text).
2. O próprio painel do Coolify vai listar as variáveis que estão faltando "Aquele botão + Add Variable" (ou vai ter um campo para colar elas). Você precisa obrigatóriamente cadastrar as 4 variáveis abaixo:
   * Chave 1: digite `JWT_SECRET` e no valor escreva `senha_secreta_gigante_do_sistema_12345` *(invente algo muito longo aqui para segurança)*.
   * Chave 2: digite `ADMIN_USER` e no valor escreva `admin`.
   * Chave 3: digite `ADMIN_PASS` e no valor escreva `SuaSenhaDoAdmin123!`.
   * Chave 4: digite `USER_PASS` e no valor escreva `SuaSenhaAcessoComumEstagiario`.

---

## 🔗 PASSO 5: Colocando o Domínio (Seu Site)

Como os advogados vão acessar o site pelo navegador?

1. Desça a página nessa aba de "Configurações" do Compose até ver os containers (os bloquinhos que o Coolify leu do seu arquivo). 
2. Você verá `lexgen-frontend`, `lexgen-backend`, `lexgen-qdrant` e `lexgen-ollama`.
3. Clique APENAS na caixinha/engrenagem do **`lexgen-frontend`**.
4. Procure a seção **Domains** (Domínios).
5. Escreva ali o seu subdomínio onde vai ficar hospedado. Exemplo: `https://lexgen.seuescritorio.com.br` ou `https://pecas.seuescritorio.com`.
6. Não adicione nenhum domínio aos outros blocos (backend, qdrant, ollama). Eles são internos e secretos.
7. *Lembre-se: Você precisa ir lá na Cloudflare ou RegistroBr e criar um CNAME apontando `lexgen.seu...` para o IP da sua VPS, igual você fez pros seus outros sistemas no passado.*

---

## ▶️ PASSO 6: Apertando o botão de DEPLOY (Ir ao ar!)

1. Agora, suba a página lá pro topo de tudo, e bem grande haverá o botão **Deploy**. Clique nela.
2. Clique agora no ícone ou botão para abrir os **Logs**.
3. O painel preto vai começar a se mexer muito. Ele está baixando imagens, compilando o Next.js e arrumando tudo sozinho. 
4. Vá tomar um café, isso pode levar entre **5 a 10 minutos**.
5. Quando parar de correr letras, e mostrar a mensagem `Deployed successfully` ou todas as bolinhas ficarem Verdes 🟢, o sistema está online!

---

## 🧠 PASSO 7: Baixando o "Cérebro" da IA (O Passo Final e Obrigatório!)

Nesse instante, o site tá no ar, mas a Inteligência "nasceu sem cérebro". O motor Qwen 2.5 não vem embutido por padrão. Nós precisamos mandar o servidor baixar.

1. Feche os logs do deploy e volte na sua página onde mostram os 4 blocos do projeto.
2. Ache o bloco chamado **`lexgen-ollama`** e clique nele (nas configurações dele).
3. Ache a opção de **Terminal** (ou Console). É um botãozinho no Coolify que abre uma "tela preta". Execute ele.
4. Quando a tela preta carregar a linha de comando, digite isso exatemente como está aqui e aperte **Enter**:
   ```bash
   ollama pull qwen2.5:3b
   ```
5. Você verá barra de carregamentos. Ele estará fazendo o download de aproximadamente **2 Gigabytes**.
6. Aguarde até ele chegar a 100% e parar com a mensagem de "Success" (Sucesso).
7. Pode fechar o terminal e a janela do Coolify!

---

## 🎉 PASSO 8: Usando de Fato

1. Abra o seu navegador (Chrome/Edge/Safari).
2. Acesse a URL que você cadastrou lá no Passo 5 (Ex: `https://lexgen.seuescritorio.com.br`).
3. Vai aparecer a tela de Login bonitona.
4. Coloque seu Usuário: `admin` e sua Sensha: `SuaSenhaDoAdmin123!` (As que você colocou no Passo 4).
5. Pronto! Acesse a área de UPLOAD, pegue umas petições em DOCX ou PDF do seu escritório, faça upload e espere a barrinha encher. Sua IA acabou de aprender com seus arquivos e o banco vetorial está com os dados seguros!
