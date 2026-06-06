# --- Estágio de Build ---
FROM node:20-alpine AS build

WORKDIR /app

# Copia os arquivos do package e instala as dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante dos arquivos da aplicação e faz o build
COPY . .
RUN npm run build

# --- Estágio de Produção ---
FROM nginx:stable-alpine

# Copia os artefatos gerados do estágio de build para o diretório html do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a configuração customizada do nginx para roteamento SPA, se necessário
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
