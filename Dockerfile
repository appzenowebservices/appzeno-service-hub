# ---------- Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

# CRA production build (built in the builder stage above)
COPY --from=builder /app/build ./build
# Express API server + content seed data (server loads src/data/content.js)
COPY server ./server
COPY src ./src

EXPOSE 3000
CMD ["node", "server/index.js"]
