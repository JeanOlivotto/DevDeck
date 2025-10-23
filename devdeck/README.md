# DevDeck - Gerenciador de Tarefas

Aplicação completa de gerenciamento de tarefas estilo Kanban, construída com Next.js, TypeScript e Prisma.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados (pode ser alterado para PostgreSQL/MySQL)
- **TailwindCSS** - Estilização
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Nodemailer** - Envio de emails
- **Baileys** - Integração com WhatsApp (opcional)

## 📋 Funcionalidades

- ✅ Autenticação com JWT
- ✅ Criação e gerenciamento de quadros (boards)
- ✅ Criação, edição e exclusão de tarefas
- ✅ Sistema Kanban com drag-and-drop
- ✅ Notificações por email (resumo diário, tarefas paradas)
- ✅ Notificações por WhatsApp (opcional)
- ✅ Interface responsiva e moderna

## 🛠️ Instalação

1. **Clone o repositório e navegue até a pasta:**
   ```bash
   cd /home/andre/projects/DevDeck/devdeck
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as informações necessárias (principalmente EMAIL_USER e EMAIL_PASS para notificações)

4. **Execute as migrations do Prisma:**
   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação:**
   - Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📝 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Cria build de produção
npm start            # Inicia servidor de produção
npm run lint         # Executa o linter
```

## 🗄️ Banco de Dados

O projeto usa Prisma ORM com SQLite por padrão. Para usar outro banco de dados:

1. Altere o `provider` no arquivo `prisma/schema.prisma`
2. Atualize a `DATABASE_URL` no `.env`
3. Execute `npx prisma migrate dev`

## 📧 Configuração de Email

Para usar notificações por email, configure as seguintes variáveis no `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
```

**Nota:** Para Gmail, você precisa gerar uma senha de app nas configurações de segurança.

## 🔐 Segurança

- Senhas são criptografadas com bcrypt
- Autenticação via JWT com tokens seguros
- Validação de dados com Zod
- Proteção de rotas no middleware

## 📱 WhatsApp (Opcional)

A funcionalidade de WhatsApp usa a biblioteca Baileys. Para ativar:

1. Configure `WHATSAPP_SESSION_PATH` no `.env`
2. Implemente a rota de conexão (código já preparado)
3. Escaneie o QR code para vincular sua conta

## 🎨 Personalização

- Cores e temas podem ser ajustados em `app/globals.css`
- Componentes estão em `components/`
- Rotas de API em `app/api/`

## 📄 Licença

Este projeto é de código aberto para uso educacional e comercial.

## 👥 Autor

Desenvolvido por @JeanOlivotto

---

**DevDeck** - Gerencie seus projetos com eficiência! 🚀
