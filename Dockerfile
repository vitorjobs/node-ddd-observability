FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src
COPY tsconfig.json ./tsconfig.json

EXPOSE 3333

CMD ["node", "--import", "tsx", "src/server.ts"]
