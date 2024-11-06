const express = require('express')
const amqp = require('amqplib/callback_api')

const app = express()
app.use(express.json())

amqp.connect('amqp://localhost', (err, connection) => {
    if (err) {
        throw err;
    }
    connection.createChannel((err, channel) => {
        if (err) {
            throw err;
        }
        const queue = "test"
        channel.assertQueue(queue, {
            durable: false
        })
        console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);
        channel.consume(queue, (msg) => {
            console.log(` [x] Received ${msg.content.toString()}`);
        }, {
            noAck: true
        })
    })
})

app.post('/mq/create/chatroom', (req, res) => {
    const { chatroom, message } = req.body
    console.log(chatroom, message)
    amqp.connect('amqp://localhost', (err, connection) => {
        if (err) {
            throw err;
        }
        connection.createChannel((err, channel) => {
            if (err) {
                throw err;
            }
            const queue = chatroom
            channel.assertQueue(queue, {
                durable: false
            })
            console.log(`[*] Waiting for messages in ${queue}. To exit press CTRL+C`);
            channel.consume(queue, (msg) => {
                console.log(`[x] Received ${msg.content.toString()}`);
            }, {
                noAck: true
            })
        })
    })
    res.send('ok')
})

app.listen(3200, () => {
    console.log('Server is running on port 3200')
})