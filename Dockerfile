# ----------------------------
# 1. BUILD aşaması
# ----------------------------
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y python3 make g++ \
  && npm install -g node-gyp

WORKDIR /app

COPY package*.json ./
RUN npm install

# Native modül rebuild et → EN ÖNEMLİ ADIM
RUN npm rebuild better-sqlite3

COPY . .

RUN npm pkg delete scripts.postinstall

RUN npm run build

# ----------------------------
# 2. PRODUCTION aşaması
# ----------------------------
FROM node:20-slim

WORKDIR /app

# Modülleri ve Nitro build’ini kopyala
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
