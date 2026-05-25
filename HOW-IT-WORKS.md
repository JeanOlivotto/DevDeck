# BJGROUP Suporte — Como o Sistema Funciona

## Arquitetura

```
devdeck-frontend/   → PHP + Tailwind CDN (Apache)
devdeck-backend/    → NestJS + Prisma + MySQL (porta 3001)
```

O frontend é servido pelo Apache em `http://localhost/DevDeck/devdeck-frontend/`.
O backend expõe uma API REST em `http://localhost:3001/api`.
Toda comunicação frontend → backend usa JWT armazenado em `localStorage` via `DevDeck.getAuthToken()`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | PHP 8, Tailwind CDN, Vanilla JS |
| Backend | NestJS 11, TypeScript |
| ORM | Prisma (MySQL) |
| Banco | MySQL 8 (remoto: 10.68.0.30) |
| Autenticação | JWT (via `@nestjs/jwt`) + sessão PHP (`set-session.php`) |
| Upload de arquivos | Multer (`@nestjs/platform-express`) |
| Notificações real-time | Pusher |
| Notificações Discord | Webhook por board |
| E-mail | Nodemailer (notificação de mudança de status) |
| Tarefas agendadas | `@nestjs/schedule` (resumo diário, tarefas paradas) |

---

## Autenticação

1. Usuário faz login em `index.php` → `POST /api/auth/login`
2. Backend retorna `access_token` (JWT)
3. Frontend salva o token em `localStorage` e chama `api/set-session.php` para criar sessão PHP
4. Toda requisição autenticada envia `Authorization: Bearer <token>`
5. A sessão PHP é usada apenas para checar `isLoggedIn()` e redirecionar no PHP — o JWT é a fonte de verdade

---

## Banco de Dados — Modelos principais

### User
- `id`, `email`, `name`, `password` (hash bcrypt)
- `company` — empresa da holding (Aplicari, Previnity, TaxResearch)
- `isDevTeam` — `true` = dev, `false` = funcionário
- `discordWebhook`, `notifyDailySummary`, `notificationDays`, `notifyStaleTasks`

### Board
- `id`, `name`, `type` (`personal` | `group`)
- `userId` ou `groupId` — pertence a um usuário ou grupo
- `isPublicTicketBoard` + `publicToken` — habilita o widget público
- `isMainTicketBoard` — recebe tickets de funcionários autenticados
- `discordWebhook` — webhook Discord específico do board

### Task
- `id`, `title`, `description`, `status` (`TODO` | `DOING` | `DONE`)
- `priority` (`LOW` | `MEDIUM` | `HIGH` | `URGENT`)
- `boardId`, `assignedUserId`
- `isTicket` — `true` para tickets vindos de funcionários ou widget
- `requesterName`, `requesterEmail`, `requesterUserId` — quem abriu o ticket
- `category` — Bug / Nova Funcionalidade / Acesso / Solicitação Geral
- `attachments` — JSON array de caminhos (`["/uploads/uuid.png"]`)
- `tags`, `dueDate`, `estimatedTime`

### Group / GroupMember
- Grupos de devs com convite por e-mail (`inviteStatus`: `pending` | `accepted`)
- Roles: `owner` | `member`

---

## Fluxo de Ticket (completo)

### Via Widget Público (sem login)
```
Site da empresa
  └─ widget.js (snippet embutido)
       └─ clique no botão flutuante
            └─ iframe → ticket.php?token=TOKEN&embedded=1
                 └─ formulário 4 passos (categoria, identidade, detalhes+arquivos)
                      └─ FormData → POST /api/tasks/ticket/:token
                           └─ Task criada no board com isPublicTicketBoard=true
                                └─ postMessage('ticket-submitted') → overlay fecha
```

### Via Portal Autenticado (funcionário logado)
```
portal.php
  └─ botão "Abrir Novo Ticket"
       └─ modal 3 passos (categoria, título, detalhes+arquivos)
            └─ FormData + JWT → POST /api/tasks/employee-submit
                 └─ Task criada no board com isMainTicketBoard=true
                      └─ requesterUserId salvo → notificação por e-mail ao mudar status
```

---

## Upload de Arquivos

- Multer salva em `devdeck-backend/uploads/<uuid>.<ext>`
- `ServeStaticModule` expõe esses arquivos em `GET /uploads/<uuid>.<ext>`
- Os caminhos são salvos no campo `task.attachments` como JSON: `["/uploads/abc.png"]`
- Máximo de 5 arquivos por ticket
- Aceita: imagens (`image/*`) e PDFs

---

## Notificações

| Evento | Canal |
|---|---|
| Status do ticket muda | E-mail para o solicitante |
| Tarefa criada/movida num board com webhook | Discord (webhook do board) |
| Resumo diário (cron) | Discord (webhook pessoal do dev) |
| Tarefa parada há X dias (cron) | Discord |

---

## Estrutura de Arquivos Relevantes

```
devdeck-frontend/
  index.php               login
  views/dashboard.php     interface do dev (Kanban)
  views/portal.php        interface do funcionário (tickets)
  views/signup.php        cadastro
  ticket.php              formulário público de ticket (usado pelo widget)
  assets/js/
    main.js               DevDeck SDK (fetchApi, getAuthToken, etc.)
    kanban.js             lógica do board
    kanban-modals.js      modal de task
    kanban-board-modal.js modal de configuração do board
    portal.js             lógica do portal do funcionário
    widget.js             snippet embeddable para sites externos
  assets/css/style.css    tema B&W global

devdeck-backend/
  src/
    auth/                 login, registro, JWT
    user/                 /user/me, /user/settings
    board/                CRUD de boards + rota pública
    task/                 CRUD de tasks + rotas de ticket
    group/                grupos e convites
    email/                Nodemailer
    discord/              webhooks Discord
    notification/         crons de notificação
  prisma/schema.prisma    modelos do banco
  uploads/                arquivos enviados pelos usuários
```
