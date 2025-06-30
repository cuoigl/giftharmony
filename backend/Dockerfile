# Dockerfile for giftharmony backend (Node.js/Express)
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Fly.io sẽ set biến môi trường PORT, server.js đã hỗ trợ
EXPOSE 8080

CMD ["node", "server.js"] 