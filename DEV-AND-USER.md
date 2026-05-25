# BJGROUP Suporte — Dev vs. Usuário

## Visão Geral

O sistema tem dois perfis distintos com interfaces separadas. O campo `isDevTeam` no banco determina qual interface o usuário acessa após o login.

---

## Perfil Dev (Time de Desenvolvimento)

**Acesso:** `http://seudominio.com/views/dashboard.php`

Redirecionado automaticamente após login se `isDevTeam = true`.

### O que o dev faz

- Cria e gerencia **Boards** (quadros Kanban), pessoais ou por grupo
- Cria **Grupos** e convida outros devs por e-mail
- Move tarefas entre colunas: **A Fazer → Em Andamento → Concluído**
- Atribui tarefas a membros do grupo
- Recebe tickets vindos dos funcionários e os acompanha no Kanban
- Filtra tickets por empresa (Aplicari / Previnity / TaxResearch) via barra de abas acima do Kanban
- Configura boards como **Board Principal de Tickets** (recebe tickets de funcionários autenticados)
- Configura boards como **Board Público de Tickets** e gera um `publicToken` para o widget embeddable
- Define webhook Discord por board para notificações automáticas
- Gerencia configurações pessoais (e-mail de notificação, dias de alerta)

### Fluxo típico

1. Faz login → vai para o dashboard
2. Cria um grupo para a equipe (ex.: "Time DevOps")
3. Convida membros por e-mail
4. Cria boards dentro do grupo
5. Marca um board como "Board Principal de Tickets" → recebe tickets dos funcionários
6. Gera `publicToken` em outro board → cola o snippet `widget.js` no site da empresa
7. Tickets chegam automaticamente na coluna "A Fazer"
8. Ao mudar o status do ticket, o funcionário recebe e-mail automático

---

## Perfil Usuário (Funcionário)

**Acesso:** `http://seudominio.com/views/portal.php`

Redirecionado automaticamente após login se `isDevTeam = false`.

### O que o funcionário faz

- Abre tickets para o time de desenvolvimento através de um formulário em 3 passos
- Acompanha o status dos próprios tickets (Na Fila / Em Andamento / Concluído)
- Recebe notificação por e-mail quando o status do ticket muda
- Edita o próprio nome no perfil

### Fluxo de abertura de ticket (3 passos)

1. **Categoria** — Bug / Nova Funcionalidade / Acesso ao Sistema / Solicitação Geral
2. **Título** — resumo em uma linha
3. **Detalhes + Anexos** — descrição livre, opção de anexar imagens ou PDFs (máx. 5)

Ao enviar, o ticket cai direto no board marcado como "Board Principal de Tickets" na coluna "A Fazer".

### Cadastro de funcionários

O dev (ou admin) registra o funcionário em `views/signup.php` selecionando a empresa à qual pertence. O campo `isDevTeam` fica `false` por padrão.

---

## Separação de rotas no backend

| Rota | Quem acessa |
|---|---|
| `POST /auth/login` | Todos |
| `POST /auth/register` | Todos |
| `GET /user/me` | Autenticado (qualquer) |
| `PATCH /user/settings` | Autenticado (qualquer) |
| `GET /boards`, `POST /boards` | Dev (JWT) |
| `GET /tasks`, `POST /tasks` | Dev (JWT) |
| `POST /tasks/employee-submit` | Funcionário autenticado (JWT) |
| `GET /tasks/my-tickets` | Funcionário autenticado (JWT) |
| `POST /tasks/ticket/:token` | Público (sem autenticação) |
| `GET /boards/public/:token` | Público (sem autenticação) |
