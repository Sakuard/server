
### Local 相關
1. 修改 ./server/.env.example 為 .env, 並設定 JWT_KEY for JWT authentication

```bash
# server
cd server
npm run dev

# test
cd test
npm run test
```

可在 http://localhost:3000/api/docs 可以看到 API 文件

### Docker 相關
```bash
docker build -t chat-server ./server/
cd server

# 確保在 ./server 底下有設置好 .env
docker run --env-file .env -p 3000:3000 chat-server
```

### GitLab CI/CD 相關
CI/CD 變數
1. ENV_FILE:
```json=
{
    Key: "ENV_FILE",
    Value: "JWT_KEY:<your_jwt_key>",
    Type: "File"
}
```