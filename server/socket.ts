import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid'
import { string, z } from 'zod'
import dotenv from 'dotenv'
import * as $z from './schema/check'
dotenv.config()

import * as $auth from './auth'


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
            socket.on('socketapi/user/join/v1', (request: SocketClient) => {
                joinChatroom(socket, request)
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

export const broadcastMessage = (io: Server, msg: any, chatroom: string) => {
    io.to(chatroom).emit('msg', msg)

}

const randomMatch = (socket: Socket, chatroom: string) => {
    // 先確認是否有 randomChatroomQueue
    if (randomChatroomQueue === "") {
        console.log(`randomChatroomQueue: `, randomChatroomQueue)
        chatroom = uuidv4()
        randomChatroomQueue = chatroom
        socket.join(chatroom)
        socket.emit('socketapi/user/join/v1', {
            "chatroom": chatroom
        })
    } else {
        console.log(`randomChatroomQueue: `, randomChatroomQueue)
        chatroom = randomChatroomQueue
        socket.join(chatroom)
        socket.emit('socketapi/user/join/v1', {
            "chatroom": chatroom
        })
        randomChatroomQueue = ""
    }
}

const getMatchChatroom = (socket: Socket, chatroom: string):string => {
    let matchRoom:string = matchChatroomQueue.get(chatroom)!
    socket.join(matchRoom)
    socket.emit('socketapi/user/join/v1', {
        "chatroom": matchRoom
    })
    matchChatroomQueue.delete(chatroom)
    return matchRoom
}
const queMatchChatroom = (socket: Socket, chatroom: string):string => {
    let queRoom = `${chatroom}-${uuidv4()}`
    matchChatroomQueue.set(chatroom, queRoom)
    socket.join(queRoom)
    socket.emit('socketapi/user/join/v1', {
        "chatroom": queRoom
    })
    return queRoom
}
const matchMatch = (socket: Socket, socketClient: SocketClient) => {

    const matchFunction = matchChatroomQueue.get(socketClient.chatroom) === undefined
        ? queMatchChatroom
        : getMatchChatroom
    matchFunction(socket, socketClient.chatroom)
}

const joinChatroom = (socket: Socket, request: SocketClient) => {
    try {
        const socketClient = $z.SocketClient.parse(request)
        
        /** 確認 User Chatroom join 行為 */
        socketClient.chatroom === ""
            ? randomMatch(socket, "")
            : matchMatch(socket, socketClient)
        console.log(`joinChatroom: `, socketClient)
    } catch (e) {
        console.log(e)
        socket.emit('socketapi/user/join/v1', e)
    }
}
