# 🚀 Guia Rápido - DevDeck PHP

## Iniciar o Projeto

### Opção 1: Servidor PHP Built-in (Recomendado para desenvolvimento)

```bash
cd /home/pomba/Projects/Previnity/DevDeck/devdeck-frontend
php -S localhost:8000
```

Acesse: http://localhost:8000

### Opção 2: XAMPP/WAMP/MAMP

1. Copie a pasta `devdeck-frontend` para `htdocs` (XAMPP) ou `www` (WAMP)
2. Acesse: http://localhost/devdeck-frontend

### Opção 3: Apache configurado

Se você já tem Apache configurado, basta apontar o DocumentRoot para a pasta do projeto.

## Estrutura de Arquivos

```
📦 devdeck-frontend
├── 📂 config/          # Configurações PHP
├── 📂 views/           # Páginas PHP
├── 📂 components/      # Componentes reutilizáveis
├── 📂 includes/        # Header e Footer
├── 📂 assets/          # CSS e JavaScript
├── 📂 img/             # Imagens
├── 📂 api/             # Endpoints PHP locais
├── 📄 index.php        # Página de login
├── 📄 .htaccess        # Configuração Apache
└── 📄 README_PHP.md    # Documentação completa
```

## Principais Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `index.php` | Página de login |
| `views/dashboard.php` | Dashboard principal do Kanban |
| `views/signup.php` | Página de cadastro |
| `config/config.php` | Configurações gerais |
| `assets/js/main.js` | Funções JavaScript globais |
| `assets/js/kanban.js` | Lógica do Kanban |
| `assets/js/auth.js` | Autenticação |

## Fluxo de Navegação

```
index.php (Login)
    ↓
views/signup.php (Cadastro)
    ↓
views/dashboard.php (Kanban)
    ↓
Logout → index.php
```

## Configuração

Edite `config/config.php` para ajustar:

```php
// URLs da API
define('API_BASE_URL', 'http://localhost:3000/api');

// Pusher
define('PUSHER_KEY', 'sua-key-aqui');
define('PUSHER_CLUSTER', 'us2');
```

## Tecnologias Utilizadas

- **Backend**: PHP 7.4+
- **Frontend**: HTML5, TailwindCSS, JavaScript
- **API**: REST (NestJS)
- **Real-time**: Pusher (WebSocket)
- **Autenticação**: JWT

## Comandos Úteis

### Verificar versão do PHP
```bash
php -v
```

### Verificar erros de sintaxe
```bash
php -l config/config.php
```

### Limpar cache de sessão
```bash
rm -rf /tmp/sess_*
```

## Resolução de Problemas

### Erro: "Call to undefined function session_start()"
- Instale ou habilite a extensão `session` do PHP

### Erro: "Headers already sent"
- Verifique se não há espaços ou BOM antes de `<?php`
- Certifique-se de não haver `echo` antes de `header()`

### Erro: "Failed to load resource: net::ERR_CONNECTION_REFUSED"
- Verifique se o servidor PHP está rodando
- Verifique se a porta 8000 está livre

### Erro 404 em arquivos CSS/JS
- Verifique se os caminhos estão corretos
- Use caminhos absolutos começando com `/`

## Próximos Passos

1. ✅ Faça login ou crie uma conta
2. ✅ Crie seu primeiro quadro (board)
3. ✅ Adicione tarefas nas colunas
4. ✅ Arraste e solte tarefas entre colunas
5. ✅ Configure notificações no menu do usuário

## Suporte

Problemas? Verifique:
- Console do navegador (F12)
- Logs do PHP
- Conexão com a API
- Configurações no `config/config.php`

---

**Versão**: 2.0.0  
**Última atualização**: Dezembro 2025
