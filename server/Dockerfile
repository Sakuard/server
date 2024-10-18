# 使用官方 Node.js 輕量版映像作為基礎
FROM node:18-alpine

# 設定工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴包
RUN npm install

# 複製專案所有檔案進入容器
COPY . .

# 編譯 TypeScript
RUN npx tsc

# 開放服務的 Port
EXPOSE 3000

# 啟動應用程式
CMD ["node", "dist/app.js"]