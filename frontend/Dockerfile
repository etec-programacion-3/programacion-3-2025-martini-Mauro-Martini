# ── ETAPA 1: Build de React ───────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias primero (mejor caché)
COPY package*.json ./
RUN npm install

# Copiar el código y hacer el build de producción
COPY . .
RUN npm run build

# ── ETAPA 2: Servir con Nginx ─────────────────────────────────────────────────
# Nginx es un servidor web liviano y rápido para servir archivos estáticos
FROM nginx:alpine

# Copiar el build de React al servidor Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
