# Stage 1: Build da aplicação NestJS
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e yarn.lock (ou package-lock.json)
COPY devdeck-backend/package.json devdeck-backend/yarn.lock* devdeck-backend/package-lock.json* ./

# Instalar dependências
RUN npm install --omit=dev || npm ci --omit=dev

# Copiar código-fonte do backend
COPY devdeck-backend .

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação NestJS
RUN npm run build

# Stage 2: Imagem final com frontend estático e backend
FROM node:20-alpine

WORKDIR /app

# Instalar servidor HTTP simples para servir arquivos estáticos
RUN npm install -g serve

# Copiar dependências do stage anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copiar arquivo .env (será sobrescrito em runtime se necessário)
COPY devdeck-backend/.env .env

# Copiar frontend para ser servido
COPY devdeck-frontend ./public

# Expor portas
EXPOSE 3000 3001

# Script de inicialização
RUN mkdir -p /app/scripts
RUN cat > /app/scripts/start.sh << 'EOF'
#!/bin/sh
set -e

echo "🔧 Executando migrações Prisma..."
npx prisma migrate deploy

echo "🚀 Iniciando servidor NestJS na porta 3000..."
node dist/main.js &
BACKEND_PID=$!

echo "📦 Servindo frontend na porta 3001..."
serve -s public -l 3001 &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID
EOF

RUN chmod +x /app/scripts/start.sh

CMD ["/app/scripts/start.sh"]