const express = require('express')
const { connect } = require('amqplib');
const amqp = require('amqplib/callback_api')
const redis = require('redis')

const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
})

async function redisConnect() {
    redisClient.on('error', err => console.log(`Redis connection error: `, err))
    await redisClient.connect()
    console.log('Redis connected')
}
redisConnect()

const app = express()
app.use(express.json())


app.post('/mq/create/chatroom', (req, res) => {
    const { chatroom, message } = req.body
    amqp.connect('amqp://localhost', (err, connection) => {
        if (err) {
            throw err;
        }
        connection.createChannel((err, channel) => {
            if (err) {
                throw err;
            }
            const queue = chatroom
            const msg = message
            channel.assertQueue(queue, {
                durable: false
            })
    
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log(" [o] Sent %s", msg)
        })
        // setTimeout(function() {
        //     connection.close();
        //     process.exit(0)
        // }, 500)
    })
    // console.log(chatroom, message)

    res.send('ok')
})

app.listen(3100, () => {
    console.log('Server is running on port 3100')
})