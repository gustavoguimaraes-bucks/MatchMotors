# backend/Dockerfile
FROM node:20

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos e instala dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta do servidor
EXPOSE 3001

# Comando para rodar o servidor
CMD ["node", "server.js"]