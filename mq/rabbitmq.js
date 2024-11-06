const amqp = require('amqplib/callback_api')

class RabbitMQ {
    constructor(url) {
        this.url = url
        this.connection = null
        this.channel = null
    }

    connect() {
        return new Promise((resolve, reject) => {
            // amqp.connect(this.url, (err, connection) => {
            //     if (err) {
            //         return reject(err)
            //     }
            //     this.connection = connection
            //     connection.createChannel((err, channel) => {
            //         if (err) {
            //             return reject(err)
            //         }
            //         this.channel = channel
            //         resolve(channel);
            //     })
            // })
            if (this.connection) {
                return resolve(this.connection)
            }
            amqp.connect(this.url)
        })
    }

    assertQueue(queue, options = { durable: false}) {
        if (!this.channel) {
            throw new Error("Channel is not initialized")
        }
        this.channel.assertQueue(queue, options)
    }

    consume(queue, callback, options = { noAck: true}) {
        if (!this.channel) {
            throw new Error("Channel is not initialized")
        }
        console.log(`[*] Consuming messages from queue: ${queue}`)
        this.channel.consume(queue, callback, options)
    }
}