import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid'
import { string, z } from 'zod'
import dotenv from 'dotenv'
import amqp from 'amqplib/callback_api'
import * as $z from './schema/check'
dotenv.config()

import * as $auth from './auth'
import { $MQ } from './rabbitmq'


export interface SocketClient {
    userid: string
    chatroom: string
}
interface ChatMessage {
    userid: string
    msg: string
}
export interface ChatRoom {
    chatroom: string
    clients: string[]
    history: ChatMessage[]
}

let randomChatroomQueue : string = "";
let matchChatroomQueue : Map<string, string> = new Map()

let SocketServer: {
    userData: Map<string, string>,
    chatroomData: Map<string, ChatRoom>
} = {
    userData: new Map<string, string>(),
    chatroomData: new Map<string, ChatRoom>()
}

export function handleConnection(io: Server) {
    return (socket: Socket) => {
        try {
            // JWT verify
            let token = $z.JWT.parse(socket.handshake.headers['token'])
            $auth.jwtVerify(token)

            socket.on('socketapi/user/connection/test', () => {
                socket.emit('socketapi/user/connection/test', 'test')
            })
            // user join chatroom
            socket.on('socketapi/user/join/v1', (request: SocketClient, io) => {
                console.log(`socketapi join: `,request)
                joinChatroom(io, socket, request)
            })
    
            // user disconnect
            socket.on('socketapi/user/disconnect/v1', () => {
                // socket 全部 disconnect
                socket.disconnect()
            })
        } catch (e) {
            console.log("JWT type error",e)
            socket.emit('socketapi/user/connect/v1', e)
            socket.disconnect()
        }
    }
}

const joinChatroom = (io: Server, socket: Socket, request: SocketClient) => {
    /** 要讓 socket join chatroom && 建立 MQ channel */
    try {
        console.log(`socket join:`,request)
        const socketClient = $z.SocketClient.parse(request)
        socket.join(socketClient.chatroom)

        $MQ.queueConsumer(socketClient.chatroom, (msg: string, io) => {
            io.to(socketClient.chatroom).emit('msg', msg);
        })
        console.log(`開啟 MQ channel`)
    } catch (e) {
        console.log(e)
        socket.emit('socketapi/user/join/v1', e)
    }
}
