import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from 'dotenv'

import { handleConnection } from "./socket";
import * as $z from './schema/check'
import './apidoc/api'

dotenv.config()

const port: number = 3000;
const app = express();
const server = createServer(app);
export const io = new Server(server);
app.use(express.json());

import { httpRequestDurationSeconds, metricsRouter } from "./src/metrics";
app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode})
  })
  next();
})
app.use('/metrics', metricsRouter)

import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import {swaggerOptions} from './config/swagger'
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import serviceRouter from './src/service'
app.use('/service', serviceRouter);

import authRouter from "./src/auth";
app.use('/auth', authRouter);

// app.post('/api/user/chat/v1', (req: Request, res: Response) => {
//   try {
//     const request = $z.SocketServer_ClientMsg.parse(req.body)
//     // const { msg, chatroom } = request
//     broadcastMessage(io, request.msg, request.chatroom)
//     res.status(200).send({"status": "success"})
//   } catch (e:any) {
//     console.log(`\n[ERROR]\napi: /api/user/chat/v1\nerror: ${e}\n`)
//     res.status(500).send({"status": "error", "msg": e})
//   }
// })

io.on('connection', handleConnection(io))

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
