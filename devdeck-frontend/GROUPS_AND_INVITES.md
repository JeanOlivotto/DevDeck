# Novas Funcionalidades Frontend - DevDeck

## 📋 Resumo das Implementações

Este documento descreve as novas funcionalidades adicionadas ao frontend do DevDeck para suportar gerenciamento de grupos e convites de membros.

---

## 🔔 Convites Pendentes no Dropdown do Perfil

### Funcionalidade
Uma nova seção foi adicionada ao dropdown do perfil do usuário mostrando todos os convites pendentes de grupos. O usuário pode:
- **Aceitar** um convite para entrar em um grupo
- **Rejeitar** um convite
- Ver um **badge com o número de convites** pendentes

### Arquivos Relacionados
- **[assets/js/invites.js](assets/js/invites.js)** - Lógica de gerenciamento de convites
- **[components/navbar.php](components/navbar.php)** - UI do dropdown com convites

### Funções Principais

#### `loadPendingInvites()`
Carrega os convites pendentes da API `/groups/invites/pending`
```javascript
const invites = await loadPendingInvites();
```

#### `updateInvitesDisplay()`
Renderiza os convites na UI e atualiza o badge
```javascript
updateInvitesDisplay();
```

#### `handleAcceptInvite(groupId, buttonElement)`
Aceita um convite de grupo
```javascript
await handleAcceptInvite(groupId, buttonElement);
```

#### `handleRejectInvite(groupId, buttonElement)`
Rejeita um convite de grupo
```javascript
await handleRejectInvite(groupId, buttonElement);
```

### Features
- ✅ Auto-recarregamento a cada 30 segundos
- ✅ Recarrega ao abrir o dropdown
- ✅ Badge mostrando quantidade de convites
- ✅ Feedback visual ao processar ações

---

## 👥 Gerenciamento de Grupos

### Funcionalidade
Sistema completo para gerenciar grupos, incluindo:
- Criar novos grupos
- Editar grupos existentes
- Deletar grupos
- Convidar membros
- Gerenciar membros do grupo
- Ver tasks de um grupo

### Arquivos Relacionados
- **[assets/js/groups.js](assets/js/groups.js)** - API e lógica de grupos
- **[assets/js/group-modals.js](assets/js/group-modals.js)** - Gerenciamento de modais
- **[components/modals.php](components/modals.php)** - Modais HTML

### Funções Principais

#### Operações de Grupos

```javascript
// Carregar todos os grupos
const groups = await loadGroups();

// Obter detalhes de um grupo
const group = await getGroupDetails(groupId);

// Criar novo grupo
const group = await createGroup(name, description);

// Atualizar grupo
await updateGroup(groupId, name, description);

// Deletar grupo
await deleteGroup(groupId);
```

#### Operações de Membros

```javascript
// Convidar membro
await inviteGroupMember(groupId, email, role = 'member');

// Obter membros do grupo
const members = await getGroupMembers(groupId);

// Remover membro
await removeGroupMember(groupId, memberId);
```

#### Operações de Tasks em Grupo

```javascript
// Carregar tasks de um board
const tasks = await loadGroupBoardTasks(boardId);

// Criar task
await createGroupBoardTask(boardId, title, description, status);

// Atualizar task
await updateGroupBoardTask(taskId, title, description, status, boardId);

// Deletar task
await deleteGroupBoardTask(taskId);
```

---

## 📱 Modais de Grupos

### Group Modal
Cria ou edita um grupo.
```javascript
openGroupModal(groupId);  // null para criar novo
closeGroupModal();
```

**Campos:**
- Nome (obrigatório)
- Descrição (opcional)

**Botões:**
- Salvar
- Cancelar
- Deletar (apenas em modo edição)

### Invite Member Modal
Convida um novo membro para um grupo.
```javascript
openInviteMemberModal(groupId);
closeInviteMemberModal();
```

**Campos:**
- Email (obrigatório)
- Função (member/admin)

**Botões:**
- Convidar
- Cancelar

### Group Members Modal
Lista e gerencia membros de um grupo.
```javascript
openGroupMembersModal(groupId);
closeGroupMembersModal();
```

**Features:**
- Mostra nome, email e função do membro
- Botão para remover membro
- Confirmação antes de remover

---

## 🔌 Integração com o Dashboard

Todos os scripts estão carregados no `views/dashboard.php`:

```html
<script src="<?php echo url('assets/js/kanban.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban-modals.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban-settings.js'); ?>"></script>
<script src="<?php echo url('assets/js/invites.js'); ?>"></script>
<script src="<?php echo url('assets/js/groups.js'); ?>"></script>
<script src="<?php echo url('assets/js/group-modals.js'); ?>"></script>
```

A inicialização automática ocorre em `setupEventListeners()`:
```javascript
// Convites de grupos
setupInvitesListeners();
loadPendingInvites();

// Modais de grupos
setupGroupModalListeners();
loadGroups();
```

---

## 🎨 UI Components

### Badge de Convites
Localizado no header do dropdown do perfil
- Cor: Vermelha
- Texto: Número de convites pendentes
- Desaparece quando não há convites

### Seção de Convites Pendentes
Localizada no dropdown do perfil, logo abaixo do nome do usuário
- Header com ícone e título "Convites de Grupos"
- Lista de convites com botões Aceitar/Rejeitar
- Mensagem "Nenhum convite pendente" quando vazio

### Modais com Design Consistente
Todos os modais seguem o design do sistema:
- Fundo semi-transparente
- Conteúdo centrado
- Tema escuro (cinza/azul)
- Acentos em ciano/magenta

---

## 📡 APIs Utilizadas

### Backend Endpoints

**Grupos:**
- `GET /groups` - Listar grupos
- `GET /groups/:id` - Obter detalhes
- `POST /groups` - Criar grupo
- `PATCH /groups/:id` - Atualizar grupo
- `DELETE /groups/:id` - Deletar grupo

**Convites:**
- `GET /groups/invites/pending` - Listar convites pendentes
- `POST /groups/:id/invite` - Convidar membro
- `POST /groups/:id/accept-invite` - Aceitar convite
- `POST /groups/:id/reject-invite` - Rejeitar convite

**Membros:**
- `GET /groups/:id/members` - Listar membros
- `DELETE /groups/:id/members/:memberId` - Remover membro

**Tasks em Grupo:**
- `GET /tasks?boardId=:boardId` - Listar tasks
- `POST /tasks` - Criar task
- `PATCH /tasks/:id` - Atualizar task
- `DELETE /tasks/:id` - Deletar task

---

## ⚙️ Configuração

Não há configuração necessária. Os arquivos foram integrados automaticamente no dashboard.

### Variáveis Globais Disponíveis

```javascript
// Em invites.js
pendingInvites              // Array de convites pendentes

// Em groups.js
allGroups                   // Array de todos os grupos
currentGroupId              // ID do grupo selecionado

// Em group-modals.js
groupModalState             // Estado do modal de grupo
```

---

## 🐛 Tratamento de Erros

Todos os erros são tratados com:
- Mensagens amigáveis ao usuário via `DevDeck.showAlert()`
- Logs no console para debugging
- Botões são restaurados ao estado normal em caso de erro

Exemplo:
```javascript
try {
    await handleAcceptInvite(groupId, button);
} catch (error) {
    DevDeck.showAlert(error.message || 'Erro ao aceitar convite', 'Erro');
    button.disabled = false;
    button.textContent = 'Aceitar';
}
```

---

## 🔐 Segurança

- Todas as requisições usam JWT Authentication
- Emails e nomes são escapados para prevenir XSS
- Confirmações obrigatórias para ações destrutivas
- Validação de dados no frontend e backend

---

## 📝 Exemplo de Uso

### Aceitar um convite
1. Abrir dropdown do perfil
2. Ver seção "Convites de Grupos"
3. Clicar em "Aceitar" no convite desejado
4. Confirmação de sucesso

### Criar um novo grupo
1. Acessar menu de grupos (implementar botão conforme necessário)
2. Clicar em "+ Novo Grupo"
3. Preencher nome e descrição
4. Clicar em "Salvar"

### Convidar membro para grupo
1. Abrir modal do grupo
2. Clicar em "Convidar Membro" (implementar conforme necessário)
3. Inserir email do membro
4. Selecionar função (member/admin)
5. Clicar em "Convidar"

---

## 🚀 Melhorias Futuras

- [ ] Interface visual para listar/criar grupos no dashboard
- [ ] Página dedicada de configurações de grupos
- [ ] Permissões granulares por função
- [ ] Convites em tempo real com Pusher
- [ ] Notificações de novos convites
- [ ] Histórico de atividades do grupo

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador para erros
2. Network tab para verificar requisições à API
3. Logs do backend para issues de servidor

