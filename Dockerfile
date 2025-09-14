# ----------------------------
# 1. BUILD aşaması
# ----------------------------
FROM node:20.14.0-slim AS builder

RUN apt-get update && apt-get install -y python3 make g++

WORKDIR /app

COPY .env .env
COPY package*.json ./
RUN npm install

COPY . .

RUN npm pkg delete scripts.postinstall
RUN npm run build


# ----------------------------
# 2. PRODUCTION aşaması
# ----------------------------
FROM node:20.14.0-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env .env

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
