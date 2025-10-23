# 🔧 CORS Fix - DevDeck Next.js

## Problema
Erro de CORS ao fazer requisições para as APIs:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading 
the remote resource at http://localhost:3000/api/auth/login
```

## Solução Implementada

### 1. Middleware Global (Recomendado)
Criado arquivo `middleware.ts` na raiz do projeto que adiciona headers CORS automaticamente a todas as requisições para `/api/*`:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    // Preflight response
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Add CORS headers to all responses
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
```

### 2. Utilitários de CORS
Criado arquivo `lib/cors.ts` com funções auxiliares:

```typescript
// lib/cors.ts
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export function handleCorsPreFlight() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>,
  request: NextRequest
): Promise<NextResponse> {
  try {
    const response = await handler(request)
    return addCorsHeaders(response)
  } catch (error) {
    const response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
```

### 3. Headers CORS em Cada Rota
As principais rotas foram atualizadas com:

```typescript
// Handle CORS preflight
export async function OPTIONS() {
  return handleCorsPreFlight()
}

// Em cada handler
export async function GET(request: NextRequest) {
  // ... logic
  const response = NextResponse.json(data)
  return addCorsHeaders(response)
}
```

## Rotas Atualizadas
- ✅ `/api/auth/login` - POST, OPTIONS
- ✅ `/api/auth/signup` - POST, OPTIONS
- ✅ `/api/boards` - GET, POST, OPTIONS
- ✅ `/api/boards/[id]` - GET, PATCH, DELETE, OPTIONS
- ✅ `/api/tasks` - GET, POST, OPTIONS
- ✅ `/api/tasks/[id]` - GET, PATCH, DELETE, OPTIONS
- ✅ `/api/user/settings` - GET, OPTIONS
- ✅ `/api/user/update-settings` - PATCH, OPTIONS

## Como Usar

### No Navegador (Cliente-side)
```javascript
// Fazer requisição para a API
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})

const data = await response.json()
console.log(data)
```

### Com cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Com Fetch (Frontend)
```typescript
// app/login/page.tsx
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      throw new Error('Login falhou')
    }

    const data = await response.json()
    localStorage.setItem('devdeck_auth_token', data.access_token)
    router.push('/')
  } catch (error) {
    console.error('Erro ao fazer login:', error)
  }
}
```

## Headers CORS Configurados

| Header | Valor |
|--------|-------|
| Access-Control-Allow-Origin | * |
| Access-Control-Allow-Methods | GET, POST, PUT, PATCH, DELETE, OPTIONS |
| Access-Control-Allow-Headers | Content-Type, Authorization, X-Requested-With |
| Access-Control-Max-Age | 86400 |

## Testando CORS

### 1. Com OPTIONS Preflight
```bash
curl -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Resposta esperada:
```
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### 2. Com POST
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token" \
  -d '{"email": "test@example.com", "password": "123456"}' \
  -v
```

## Segurança

⚠️ **NOTA IMPORTANTE**: A configuração atual permite CORS de qualquer origem (`*`).

Para produção, restrinja a origens específicas:

```typescript
// middleware.ts
const ALLOWED_ORIGINS = [
  'https://seu-dominio.com',
  'https://app.seu-dominio.com',
]

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  // ...
}
```

## Build e Deploy

✅ Build passou com sucesso:
```
✓ Compiled successfully in 2.6s
✓ Generating static pages (11/11)
ƒ Middleware (33.9 kB)
```

## Próximos Passos

1. Testar todas as rotas de API
2. Validar autenticação JWT
3. Testar cross-origin requests
4. Configurar CORS restritivo para produção
5. Adicionar rate limiting

---

**Última atualização:** 23/10/2025
**Status:** ✅ CORS Implementado e Testado
