# Etapa 1: Build da aplicação
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gera o Prisma Client (vai usar o schema.prisma)
RUN npx prisma generate

# Etapa 2: Imagem final para produção
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app /app

# Porta exposta
EXPOSE 3001

CMD ["npm", "run", "dev"]
