import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { createClient} from 'redis'

// const redisClient = createClient({
//     socket: {
//         host: 'localhost',
//         port: 6379
//     },
//     username: 'redis',
//     password: 'cXBXbnlnRk1VaA=='
// })
const redisClient = createClient({
    url: 'redis://:qpWnygFMUh@localhost:6379'
})

const redisConnect = async () => {
    redisClient.on('error', err => console.log(`Redis connection error: `, err));

    try {
        await redisClient.connect();
        console.log('Redis connected');
        if (await redisClient.get("") === null) {
            let room = uuidv4()
            redisClient.set('', room)
            await redisClient.get('') === room ? console.log(`correct`) : console.log(`wrong`)
            console.log(`got room: ${room}`)
        } else if (await redisClient.get('') !== null) {
            let room = await redisClient.get('')
            redisClient.del('')
            console.log(`got room: ${room}`)
        }
    } catch (err) {
        console.error('Connection or operation error:', err);
    }
};

const redisGet = async () => {
    // console.log(await redisClient.get(''))
    if (await redisClient.get('') === null) {
        console.log(`got null`)
    } else if (await redisClient.get('') === undefined ) {
        console.log(`undefined`)
    }
}

// 呼叫連接函數
redisConnect();
// redisGet();


const app = express()
const server = createServer(app)
const io = new Server(server)
app.use(express.json())

interface joinRequest {
    user: string
    chatroom: string
}

let queueApi: Map<string, string> = new Map()
let queueSocket: Map<string, string> = new Map()

app.post('/queue/api', async (req: Request, res: Response) => {
    const { user, chatroom } = req.body

    let room:string = ''
    if (chatroom === "") {
        console.log(`chatroom: ${await redisClient.get("")}`)
        // if (await redisClient.get("")) {
        //     room = .get("")!
        //     queueApi.delete("")
        // } else {
        //     room = uuidv4()
        //     queueApi.set("", room)
        // }
    } 
    
    res.send({room: room})
})

io.on('connection', (socket: Socket) => {
    socket.on('queue/socket', (request: joinRequest) => {
        console.log(request)
        let room:string = ''
        if (request.chatroom === "") {
            if (queueSocket.has("")) {
                room = queueSocket.get("")!
                queueSocket.delete("")
            } else {
                room = uuidv4()
                queueSocket.set("", room)
            }
        }
        socket.emit('queue/socket', {room: room})
    })
})

app.listen(3300, () => {
    console.log('Server is running on port 3300')
})