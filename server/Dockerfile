# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx tsc

# Stage 2: Production
FROM node:18-alpine
WORKDIR /usr/src/app

# 複製 builder 階段編譯後的檔案和生產依賴
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/app.js"]