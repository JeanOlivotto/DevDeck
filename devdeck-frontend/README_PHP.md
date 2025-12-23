# DevDeck - Versão PHP Reorganizada

## 📁 Nova Estrutura do Projeto

```
devdeck-frontend/
├── config/
│   └── config.php              # Configurações gerais e funções auxiliares
├── includes/
│   ├── header.php              # Cabeçalho HTML padrão
│   └── footer.php              # Rodapé HTML padrão
├── views/
│   ├── dashboard.php           # Página principal do Kanban
│   └── signup.php              # Página de cadastro
├── components/
│   ├── navbar.php              # Barra de navegação
│   ├── loading.php             # Indicador de carregamento
│   ├── modals.php              # Todos os modais
│   ├── whatsapp-config.php     # Configuração WhatsApp Meta
│   └── whatsapp-tutorial-modal.php  # Modal do tutorial WhatsApp
├── assets/
│   ├── css/
│   │   └── style.css           # Estilos CSS
│   └── js/
│       ├── main.js             # Funções globais e utilitárias
│       ├── auth.js             # Lógica de autenticação
│       ├── kanban.js           # Lógica principal do Kanban
│       ├── kanban-modals.js    # Modais e drag-and-drop
│       └── kanban-settings.js  # Configurações e WhatsApp
├── api/                        # (Para futuras implementações PHP locais)
├── img/                        # Imagens do projeto
├── index.php                   # Página de login (ponto de entrada)
└── README_PHP.md               # Esta documentação

## 🚀 Mudanças Principais

### 1. **Separação de Responsabilidades**
- ✅ **PHP**: Gerencia sessões, autenticação e renderização de views
- ✅ **JavaScript**: Lida com interações do usuário e comunicação com API
- ✅ **Componentes**: Reutilizáveis em múltiplas páginas

### 2. **Estrutura Modular**
- Cada funcionalidade tem seu próprio arquivo
- Fácil manutenção e escalabilidade
- Código mais organizado e legível

### 3. **Sistema de Rotas**
- `index.php` → Login
- `views/signup.php` → Cadastro
- `views/dashboard.php` → Dashboard do Kanban

### 4. **Gerenciamento de Sessão**
- Sessão PHP para controle de autenticação
- LocalStorage para persistência de tokens
- Redirecionamento automático baseado no estado de login

## 📝 Arquivos Principais

### config/config.php
Contém:
- Constantes de configuração (API, Pusher, etc)
- Funções auxiliares (isLoggedIn, getAuthToken, apiRequest, etc)
- Inicialização de sessão

### views/dashboard.php
- Página principal do Kanban
- Inclui navbar, loading, modals
- Carrega scripts: kanban.js, kanban-modals.js, kanban-settings.js

### assets/js/main.js
Funções globais disponíveis via `window.DevDeck`:
- `getAuthToken()`, `setAuthToken(token)`
- `clearAuthData()`, `setUserData(email, name)`
- `showLoading()`, `hideLoading()`
- `showAlert(message, title)`, `showConfirm(message, title)`
- `fetchApi(endpoint, options, requireAuth)`

### assets/js/kanban.js
- Inicialização do Kanban
- Gerenciamento de boards e tarefas
- Display de usuário e avatar
- Eventos principais

### assets/js/kanban-modals.js
- Drag and drop de tarefas
- Modals de tarefas e boards
- CRUD de tarefas e boards

### assets/js/kanban-settings.js
- Configurações do usuário
- WhatsApp Meta API
- Pusher (WebSocket) para atualizações em tempo real

## 🔧 Como Usar

### Desenvolvimento Local

1. **Instalar PHP** (versão 7.4 ou superior)

2. **Iniciar servidor PHP**:
```bash
cd /home/pomba/Projects/Previnity/DevDeck/devdeck-frontend
php -S localhost:8000
```

3. **Acessar no navegador**:
```
http://localhost:8000
```

### Configuração

Edite `config/config.php` para ajustar:
- URLs da API
- Chaves do Pusher
- Configurações de sessão

### Estrutura de Sessão PHP

```php
$_SESSION['auth_token']   // Token JWT
$_SESSION['user_email']   // Email do usuário
$_SESSION['user_name']    // Nome do usuário
```

## 🎨 Componentes Reutilizáveis

### navbar.php
```php
<?php include __DIR__ . '/components/navbar.php'; ?>
```

### loading.php
```php
<?php include __DIR__ . '/components/loading.php'; ?>
```

### modals.php
```php
<?php include __DIR__ . '/components/modals.php'; ?>
```

## 🔐 Autenticação

### Fluxo de Login
1. Usuário preenche formulário em `index.php`
2. JavaScript envia credenciais para API
3. API retorna token JWT
4. Token é salvo na sessão PHP e LocalStorage
5. Redirecionamento para `views/dashboard.php`

### Fluxo de Logout
1. Usuário clica em "Sair"
2. Sessão PHP é destruída
3. LocalStorage é limpo
4. Pusher é desconectado
5. Redirecionamento para `index.php`

## 🌐 Integração com API

A aplicação continua usando a API backend existente:
- **Local**: `http://localhost:3000/api`
- **Produção**: `https://dev-deck-api.vercel.app/api`

Não é necessário alterar o backend, apenas o frontend foi reorganizado.

## 📱 Recursos

- ✅ Sistema Kanban completo (To Do, Doing, Done)
- ✅ Múltiplos quadros (boards)
- ✅ Drag and drop de tarefas
- ✅ Notificações por email
- ✅ Notificações por WhatsApp (Meta API)
- ✅ Atualizações em tempo real (Pusher)
- ✅ Configurações de usuário
- ✅ Interface responsiva

## 🔄 Migração do Código Antigo

Os arquivos antigos foram mantidos:
- `index.html` → Agora é `index.php`
- `script.js` → Dividido em múltiplos arquivos JS
- `style.css` → Movido para `assets/css/style.css`

## 📚 Próximos Passos

1. **Implementar cache** para melhorar performance
2. **Adicionar testes** unitários e de integração
3. **Otimizar carregamento** de assets
4. **Implementar PWA** (Progressive Web App)
5. **Adicionar internacionalização** (i18n)

## 🐛 Debugging

Para debug, adicione no início de qualquer arquivo PHP:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

Para debug JavaScript, abra o console do navegador (F12).

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique o console do navegador
2. Verifique os logs do PHP
3. Verifique a conexão com a API
4. Verifique as configurações no `config/config.php`

---

**Versão**: 2.0.0  
**Data**: Dezembro 2025  
**Autor**: DevDeck Team
