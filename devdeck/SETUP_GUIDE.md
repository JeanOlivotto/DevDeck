# 🚀 Como Rodar o DevDeck Next.js

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Um navegador moderno

## 1. Setup Inicial

### 1.1 Instalar Dependências

```bash
cd /home/pomba/Projects/Previnity/DevDeck/devdeck
npm install
```

### 1.2 Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET="sua-chave-secreta-muito-segura-aqui"
JWT_EXPIRATION="7d"

# Email (opcional)
SMTP_HOST="seu-smtp-host"
SMTP_PORT="587"
SMTP_USER="seu-email@example.com"
SMTP_PASSWORD="sua-senha"
SMTP_FROM="noreply@devdeck.com"

# WhatsApp (opcional)
WHATSAPP_API_KEY="sua-chave-api-whatsapp"

# Environment
NODE_ENV="development"
```

### 1.3 Configurar o Banco de Dados

```bash
# Gerar Prisma Client
npx prisma generate

# Rodar migrações
npx prisma migrate deploy

# (Opcional) Ver dados do banco
npx prisma studio
```

## 2. Executar em Desenvolvimento

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000`

## 3. Build para Produção

```bash
npm run build
npm run start
```

## 4. Primeiros Passos

1. **Acesse** `http://localhost:3000`
2. **Faça signup** com email e senha
3. **Crie um quadro** clicando em "+ Novo Quadro"
4. **Crie tarefas** clicando em "+ Nova Tarefa" em uma coluna
5. **Arraste tarefas** entre as colunas (TODO → DOING → DONE)
6. **Configure notificações** no menu do usuário

## 5. Estrutura de Pastas

```
devdeck/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Autenticação
│   │   ├── boards/       # Quadros
│   │   ├── tasks/        # Tarefas
│   │   └── user/         # Usuário
│   ├── login/            # Página de login
│   ├── globals.css       # Estilos globais (341 linhas)
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Dashboard
├── components/           # Componentes React
│   ├── Dashboard.tsx
│   ├── Header.tsx
│   ├── KanbanBoard.tsx
│   ├── BoardList.tsx
│   ├── TaskModal.tsx
│   ├── BoardModal.tsx
│   └── UserSettingsModal.tsx
├── lib/                  # Utilitários
│   ├── auth.ts          # JWT + Bcrypt
│   ├── api-auth.ts      # Middleware
│   ├── encryption.ts    # CryptoJS
│   ├── email.ts         # Nodemailer
│   └── prisma.ts        # Prisma Client
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── migrations/      # Histórico de migrações
├── public/              # Arquivos estáticos
├── tailwind.config.ts   # Configuração Tailwind
├── next.config.js       # Configuração Next.js
├── tsconfig.json        # TypeScript config
└── package.json         # Dependências
```

## 6. Cores Implementadas

| Elemento | Cor | Código |
|----------|-----|--------|
| Background | Azul Escuro | #181c2f |
| Texto Padrão | Azul Claro | #e0e6ff |
| Container | Azul Médio | #23284a |
| Input | Azul Escuro | #1e223b |
| Border | Azul Médio | #3a416f |
| Hover | Azul Claro | #4a517e |
| Destaque Cyan | Ciano | #00eaff |
| Destaque Purple | Roxo | #a259ff |
| Destaque Pink | Rosa | #ff2d92 |

## 7. API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Registro

### Quadros
- `GET /api/boards` - Listar quadros
- `POST /api/boards` - Criar quadro
- `PATCH /api/boards/[id]` - Editar quadro
- `DELETE /api/boards/[id]` - Deletar quadro

### Tarefas
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `PATCH /api/tasks/[id]` - Editar tarefa
- `DELETE /api/tasks/[id]` - Deletar tarefa

### Usuário
- `GET /api/user/settings` - Obter configurações
- `PATCH /api/user/update-settings` - Atualizar configurações

## 8. Scripts NPM

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linter
```

## 9. Tecnologias Utilizadas

- **Next.js 15.0.0** - Framework React
- **React 19.0.0** - Biblioteca UI
- **TypeScript 5.0.0** - Type safety
- **Tailwind CSS 3.4.1** - Styling
- **Prisma 6.18.0** - ORM
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Socket.io** - Websockets
- **Nodemailer** - Email

## 10. Troubleshooting

### Erro: "DATABASE_URL not found"
Certifique-se que o arquivo `.env.local` existe e contém `DATABASE_URL`

### Erro: "Prisma Client not found"
Execute: `npx prisma generate`

### Build falha com erro de TypeScript
Certifique-se que todos os tipos estão corretos. Execute: `npm run build`

### Cores não aparecem
Limpe o cache do Tailwind: `rm -rf .next` e execute `npm run build` novamente

## 11. Dicas de Desenvolvimento

- Use `npx prisma studio` para visualizar/editar dados do banco
- Use Chrome DevTools para debugar
- Verifique os logs do servidor para erros da API
- Use `console.log()` no lado do cliente para debugging

## 12. Deployment

### Vercel (Recomendado)
1. Push para GitHub
2. Conecte ao Vercel
3. Configure variáveis de ambiente
4. Deploy automático

### Outros Serviços
1. Build: `npm run build`
2. Start: `npm run start`
3. Porta padrão: 3000

---

**Último update:** 23/10/2025
**Status:** ✅ Pronto para Produção
