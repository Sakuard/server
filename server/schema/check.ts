import { z } from 'zod'

export const SocketClient = z.object({
    userid: z.string().min(1, { message: 'userid must be a non-empty string' }),
    chatroom: z.string()
    // chatroom: z.string().min(1, { message: 'chatroom must be a non-empty string' })
})

export const SocketServer_ClientMsg = z.object({
    msg: z.string().min(1, { message: 'msg must be a non-empty string' }),
    chatroom: z.string().min(1, { message: 'chatroom must be a non-empty string' })
})

export const JWT_Payload = z.object({
    username: z.string().min(1, { message: 'username must be a non-empty string' }),
    role: z.enum(['admin', 'user'])
})

// 修改 JWT schema 以接受字串
export const JWT = z.string().min(1, { message: 'Token must be a non-empty string' });