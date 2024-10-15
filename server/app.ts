import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from 'dotenv'

import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import {swaggerAPIOptions, swaggerSocketOptions} from './config/swagger'

import { handleConnection, broadcastMessage } from "./socket";
import * as $z from './schema/check'
import * as $auth from './auth'
import './apidoc/api'

dotenv.config()

const port: number = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());

const swaggerAPISpec = swaggerJSDoc(swaggerAPIOptions);
const swaggerSocketSpec = swaggerJSDoc(swaggerSocketOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerAPISpec));
app.use('/socket/docs', swaggerUi.serve, swaggerUi.setup(swaggerSocketSpec));


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
    if (e.issues) {
      res.status(500).send({"status": "error", "msg": e.issues})
    } else {
      res.status(500).send({"status": "error", "msg": e})
    }
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
    if (e.issues) {
      res.status(500).send({"status": "error", "msg": e.issues})
    } else {
      res.status(500).send({"status": "error", "msg": e})
    }
  }
})

io.on('connection', handleConnection(io))

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
