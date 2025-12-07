# Etapa de build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package.json y lockfile
COPY package*.json ./

# Instalar dependencias completas (dev + prod) con pnpm
RUN pnpm install

# Copiar código fuente
COPY . .

# Compilar TypeScript con pnpm
RUN pnpm run build:prod

# Etapa de producción
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar solo package.json y lockfile
COPY package*.json ./

# Instalar solo dependencias de producción con pnpm
RUN pnpm install --prod

# Copiar dist generado desde builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "-r", "module-alias/register", "dist/main.js"]
