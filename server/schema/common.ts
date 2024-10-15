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
