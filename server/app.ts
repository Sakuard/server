import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from 'dotenv'

import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import {swaggerOptions} from './config/swagger'

import client from 'prom-client'

import { handleConnection, broadcastMessage } from "./socket";
import * as $z from './schema/check'
import * as $auth from './auth'
import './apidoc/api'

const register = new client.Registry()
client.collectDefaultMetrics({ register })
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000]
})
register.registerMetric(httpRequestDurationSeconds)

dotenv.config()

const port: number = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode})
  })
  next();
})
app.use(express.json());

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World6");
});

app.post('/api/user/auth/v1', (req: Request, res: Response) => {
  try {
    const { username, role } = $z.JWT_Payload.parse(req.body)
    const token = $auth.createToken({
      username: username,
      role: role||'user'
    })
    res.status(200).send({"status": "success", "token": token})
  } catch (e:any) {
    console.log(`\n[WARN]\napi: /api/user/auth/v1\nerror: ${e}\n`)
    res.status(500).send({"status": "error", "msg": e})
  }
})

app.post('/api/user/chat/v1', (req: Request, res: Response) => {
  try {
    const request = $z.SocketServer_ClientMsg.parse(req.body)
    const { msg, chatroom } = request
    broadcastMessage(io, msg, chatroom)
    res.status(200).send({"status": "success"})
    console.log(`success`)
  } catch (e:any) {
    console.log(`\n[WARN]\napi: /api/user/chat/v1\nerror: ${e}\n`)
    res.status(500).send({"status": "error", "msg": e})
  }
})

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (e:any) {
    res.status(500).end(e)
  }
})

io.on('connection', handleConnection(io))

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
