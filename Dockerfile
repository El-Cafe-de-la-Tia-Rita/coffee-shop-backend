# Etapa de build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar solo package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript para producción
RUN npm run build:prod

# Etapa de producción
FROM node:22-alpine

WORKDIR /app

# Copiar solo package.json y lock file
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --only=production

# Copiar dist compilado desde builder
COPY --from=builder /app/dist ./dist

# Registrar alias para Node
RUN npm install module-alias

# Exponer puerto
EXPOSE 3000

# Comando de arranque
CMD ["node", "-r", "module-alias/register", "dist/main.js"]
