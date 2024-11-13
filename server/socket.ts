import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import * as $z from './schema/check';
dotenv.config();

import * as $auth from './auth';
import { $MQ } from './rabbitmq';

export interface SocketClient {
    userid: string;
    chatroom: string;
}
interface ChatMessage {
    userid: string;
    msg: string;
}
export interface ChatRoom {
    chatroom: string;
    clients: string[];
    history: ChatMessage[];
}

let SocketServer: {
    userData: Map<string, string>,
    chatroomData: Map<string, ChatRoom>
} = {
    userData: new Map<string, string>(),
    chatroomData: new Map<string, ChatRoom>()
};

export function handleConnection(io: Server) {
    return (socket: Socket) => {
        try {
            // JWT 驗證
            let token = $z.JWT.parse(socket.handshake.headers['token']);
            $auth.jwtVerify(token);

            socket.on('socketapi/user/connection/test', () => {
                socket.emit('socketapi/user/connection/test', 'test');
            });
            // 用戶加入聊天室
            socket.on('socketapi/user/join/v1', (request: SocketClient) => {
                console.log(`socketapi join: `, request);
                joinChatroom(io, socket, request);
            });

            // 用戶斷開連接
            socket.on('socketapi/user/disconnect/v1', () => {
                // socket 全部斷開
                socket.disconnect();
            });
        } catch (e) {
            console.log("JWT type error", e);
            socket.emit('socketapi/user/connect/v1', e);
            socket.disconnect();
        }
    };
}

const joinChatroom = (io: Server, socket: Socket, request: SocketClient) => {
    /** 讓 socket 加入聊天室並建立 MQ 訂閱 */
    try {
        console.log(`socket join:`, request);
        const socketClient = $z.SocketClient.parse(request);
        socket.join(socketClient.chatroom);

        // 訂閱指定的 Exchange
        $MQ.subscribe(socketClient.chatroom, (msg: string) => {
            io.to(socketClient.chatroom).emit('msg', msg);
        });
        console.log(`開啟 MQ 訂閱`);
    } catch (e) {
        console.log(e);
        socket.emit('socketapi/user/join/v1', e);
    }
};