import amqplib, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { io } from './app'

export class RabbitMQ {
    private static instance: RabbitMQ | null = null;
    private connection: Connection | null = null;
    private channel: Channel | null = null; // 單一通道用於 producer 和 consumer

    private constructor() {}

    // Initialize instance and connect upon first call to getInstance
    public static getInstance(url: string): RabbitMQ {
        if (!RabbitMQ.instance) {
            RabbitMQ.instance = new RabbitMQ();
            RabbitMQ.instance.connect(url).catch((error) => {
                console.error('RabbitMQ 連線失敗', error);
            });
        }
        return RabbitMQ.instance;
    }

    // Connect asynchronously but handle connection on instance creation
    private async connect(url: string): Promise<void> {
        if (!this.connection) {
            try {
                this.connection = await amqplib.connect(url);
                console.log('RabbitMQ 連線成功');
                
                // 建立唯一的 Channel
                this.channel = await this.connection.createChannel();
                console.log('Channel 已建立');
            } catch (error) {
                console.error('RabbitMQ 連線或 Channel 建立失敗', error);
                throw error;
            }
        }
    }

    // 使用唯一的 Channel 初始化 Queue
    public async createChannel(queueName: string): Promise<void> {
        if (this.channel) {
            await this.channel.assertQueue(queueName, { durable: true });
            console.log(`Queue [${queueName}] 已初始化`);
        } else {
            throw new Error('Channel 未建立，無法初始化 Queue');
        }
    }

    // 發送訊息至指定的 Queue
    public async queueProducer(queueName: string, msg: string): Promise<any> {
        if (this.channel) {
            try {
                await this.channel.assertQueue(queueName, { durable: true });
                this.channel.sendToQueue(queueName, Buffer.from(msg));
                console.log(`訊息已發送至 Queue [${queueName}]: ${msg}`);
                return {status: 'success', msg: '訊息已成功發送'}
            } catch (err) {
                return {status: 'error', msg: err, type: 'queue'}
            }
        } else {
            // throw new Error('Channel 未建立，無法發送訊息');
            return {status: 'error', msg: 'Channel 未建立，無法發送訊息', type: 'channel'}
        }
    }

    // 從指定的 Queue 消費訊息
    public async queueConsumer(queueName: string, onMessage: (msg: string, io: any) => void): Promise<void> {
        if (this.channel) {
            console.log(`開啟 MQ channel for queue: ${queueName}`)
            await this.channel.assertQueue(queueName, { durable: true });
            await this.channel.consume(queueName, (msg: any) => {
                onMessage(msg.content.toString(), io);
                this.channel?.ack(msg);
            });
        } else {
            throw new Error('Channel 未建立，無法消費訊息');
        }
    }
}

// Initialize the instance upon import
export const $MQ = RabbitMQ.getInstance('amqp://localhost');
