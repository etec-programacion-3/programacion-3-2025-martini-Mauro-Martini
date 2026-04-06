# ── Backend Node.js ───────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (mejor caché)
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Puerto donde corre tu backend
EXPOSE 3001

# Comando de inicio — apunta a tu archivo principal
CMD ["node", "src/app.js"]
