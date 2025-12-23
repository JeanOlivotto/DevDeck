# 🚀 Guia de Integração - Convites e Grupos

## Resumo Rápido

Implementei 3 funcionalidades principais no frontend:

### 1. ✅ Seção de Convites Pendentes no Dropdown
- Localização: Dropdown do perfil do usuário (navbar)
- Mostra todos os convites pendentes
- Badge com número de convites
- Botões para aceitar/rejeitar

### 2. ✅ Sistema Completo de Grupos
- Criar, editar, deletar grupos
- Convidar membros
- Gerenciar membros (remover, ver roles)
- Gerenciar tasks em boards de grupo

### 3. ✅ Modais para Operações
- Modal de criar/editar grupo
- Modal de convidar membro
- Modal de gerenciar membros do grupo

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos JavaScript
```
devdeck-frontend/assets/js/
├── invites.js              ← Gerenciamento de convites
├── groups.js               ← API de grupos e tasks
├── group-modals.js         ← Lógica dos modais
└── groups-navbar.js        ← Exemplo de integração no navbar
```

### Arquivos Modificados
```
devdeck-frontend/
├── components/
│   ├── navbar.php          ← Adicionada seção de convites
│   └── modals.php          ← Adicionados 3 novos modais
├── views/
│   └── dashboard.php       ← Adicionados imports dos scripts
└── assets/js/
    └── kanban.js           ← Inicialização dos listeners
```

### Documentação
```
devdeck-frontend/
├── GROUPS_AND_INVITES.md       ← Documentação completa
└── GROUPS_INTEGRATION_GUIDE.md ← Este arquivo
```

---

## 🎯 O Que Está Funcionando

### Convites Pendentes
✅ Carregar convites da API
✅ Exibir no dropdown do perfil
✅ Aceitar convites
✅ Rejeitar convites
✅ Badge com número de convites
✅ Auto-recarregamento a cada 30s

### Grupos
✅ Carregar todos os grupos
✅ Criar novo grupo
✅ Editar grupo
✅ Deletar grupo
✅ Convidar membro para grupo
✅ Ver membros do grupo
✅ Remover membro do grupo
✅ Gerenciar tasks em boards do grupo

### Modais
✅ Modal de criar/editar grupo
✅ Modal de convidar membro
✅ Modal de gerenciar membros
✅ Validação de formulários
✅ Mensagens de sucesso/erro
✅ Confirmações para ações destrutivas

---

## 🔧 Como Usar

### 1️⃣ Ver Convites Pendentes
1. Abra o dropdown do perfil (clique no seu nome)
2. Procure pela seção "Convites de Grupos"
3. Clique em "Aceitar" ou "Rejeitar"

**Screenshot esperado:**
```
┌─────────────────────────────┐
│  Seu Nome                   │
│  seu@email.com              │🔴2
├─────────────────────────────┤
│ 👥 CONVITES DE GRUPOS       │
├─────────────────────────────┤
│ Projeto A                   │
│ Criado por: João            │
│ [Aceitar] [Rejeitar]        │
├─────────────────────────────┤
│ Projeto B                   │
│ Criado por: Maria           │
│ [Aceitar] [Rejeitar]        │
├─────────────────────────────┤
│ [Notificações...]           │
└─────────────────────────────┘
```

### 2️⃣ Adicionar Interface de Grupos (Opcional)

Se quiser adicionar uma seção de grupos no navbar:

**A. Copie o HTML de exemplo:**
```php
<div class="mt-6 mb-4 px-4">
    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Meus Grupos</h3>
    <div id="groups-container" class="space-y-2">
        <button id="create-group-button" class="group-button w-full text-left text-sm flex items-center gap-2 p-2 rounded-lg">
            <svg class="w-4 h-4"><!-- ícone de grupo --></svg>
            + Novo Grupo
        </button>
        <div id="groups-list" class="space-y-1">
            <!-- Grupos carregados aqui -->
        </div>
    </div>
</div>
```

**B. Adicione o script ao dashboard:**
```html
<script src="<?php echo url('assets/js/groups-navbar.js'); ?>"></script>
```

**C. Adicione CSS no seu style.css:**
```css
.group-button {
    @apply text-gray-300 hover:bg-purple-900/30 transition-colors;
}

.group-item-button {
    @apply text-gray-300 hover:text-white;
}

.group-item-menu {
    @apply shadow-xl;
}
```

### 3️⃣ Usar a API de Grupos

```javascript
// Carregar grupos
const groups = await loadGroups();

// Criar grupo
const newGroup = await createGroup('Meu Grupo', 'Descrição');

// Editar grupo
await updateGroup(groupId, 'Novo Nome', 'Nova Descrição');

// Convidar membro
await inviteGroupMember(groupId, 'email@example.com', 'member');

// Ver membros
const members = await getGroupMembers(groupId);

// Remover membro
await removeGroupMember(groupId, memberId);

// Gerenciar tasks
const tasks = await loadGroupBoardTasks(boardId);
await createGroupBoardTask(boardId, 'Título', 'Descrição', 'TODO');
```

---

## 🎨 Customização

### Cores
As cores seguem o tema do projeto:
- Primária: `#a259ff` (Magenta)
- Secundária: `#00eaff` (Ciano)
- Fundo: `#23284a`
- Cinza: `#6b7280`

Para mudar cores, edite:
- `assets/css/style.css`
- Classes Tailwind nos arquivos HTML

### Mensagens
As mensagens em português podem ser customizadas:
- Arquivo: `assets/js/invites.js`, `assets/js/group-modals.js`
- Procure por strings entre aspas

### Comportamento
Você pode mudar o comportamento editando:
- Intervalo de recarregamento de convites: `invites.js` linha ~130
- Campos obrigatórios do grupo: `group-modals.js`
- Validações: Cualquer arquivo `*-modals.js`

---

## 🐛 Troubleshooting

### Convites não aparecem
1. Verifique se o backend está rodando em `http://localhost:3000`
2. Verifique o token JWT no localStorage
3. Abra a Console (F12) e verifique erros
4. Verifique o Network tab para requisições falhadas

### Modais não abrem
1. Verifique se `group-modals.js` está carregado
2. Verifique se os IDs dos elementos existem em `modals.php`
3. Abra a Console e procure por mensagens de erro

### Grupos não carregam
1. Verifique se `groups.js` está carregado
2. Verifique a resposta da API: `GET /groups`
3. Se vazio, crie um grupo pelo Postman primeiro

### Mensagens de erro
- Verifique o Console (F12) para detalhes completos
- Mensagens "Erro ao carregar" geralmente indicam problema com API
- Verifique o backend logs

---

## 📊 Fluxo de Dados

```
Backend (NestJS)
    ↓
API REST (/groups, /tasks, etc)
    ↓
JavaScript (groups.js, groups-modals.js)
    ↓
HTML DOM (modals.php, navbar.php)
    ↓
Usuário (UI)
```

---

## ✨ Features Extras (Não Implementadas)

Se quiser adicionar no futuro:
- [ ] Página dedicada de grupos
- [ ] Atualizações em tempo real com Pusher
- [ ] Permissões por role (admin, member, viewer)
- [ ] Arquivo/anexos em tasks
- [ ] Comentários em tasks
- [ ] Histórico de atividades
- [ ] Search/filtro de grupos

---

## 📞 Suporte

Para dúvidas:
1. Consulte `GROUPS_AND_INVITES.md` para documentação completa
2. Verifique os exemplos em `groups-navbar.js`
3. Abra a Console (F12) para ver detalhes de erros
4. Verifique o Network tab para requisições à API

---

## ✅ Checklist de Implementação

- [x] Convites pendentes no dropdown
- [x] Modais de grupos (criar/editar/deletar)
- [x] Modal de convidar membro
- [x] Modal de gerenciar membros
- [x] API de grupos completa
- [x] Validação de formulários
- [x] Mensagens de sucesso/erro
- [x] Auto-recarregamento de convites
- [x] Exemplo de integração navbar
- [x] Documentação completa

**Próximas Etapas Sugeridas:**
1. Adicionar botões de grupo na navbar (use exemplo em `groups-navbar.js`)
2. Criar página de gerenciamento de grupos
3. Adicionar notificações em tempo real
4. Integrar com tasks para mostrar grupo em cada task

---

Implementação concluída! 🎉

