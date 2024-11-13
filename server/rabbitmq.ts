import amqplib, { Connection, Channel } from 'amqplib';
import { io } from './app';

export class RabbitMQ {
    private static instance: RabbitMQ | null = null;
    private connection: Connection | null = null;
    private channel: Channel | null = null; // 單一通道用於 producer 和 consumer

    private constructor() {}

    // 初始化實例並在第一次調用 getInstance 時連接
    public static getInstance(url: string): RabbitMQ {
        if (!RabbitMQ.instance) {
            RabbitMQ.instance = new RabbitMQ();
            RabbitMQ.instance.connect(url).catch((error) => {
                console.error('RabbitMQ 連線失敗', error);
            });
        }
        return RabbitMQ.instance;
    }

    // 異步連接，並在實例創建時處理連接
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

    // 使用唯一的 Channel 初始化 Exchange
    public async createExchange(exchangeName: string, type: string = 'fanout'): Promise<void> {
        if (this.channel) {
            await this.channel.assertExchange(exchangeName, type, { durable: false });
            console.log(`Exchange [${exchangeName}] 已初始化`);
        } else {
            throw new Error('Channel 未建立，無法初始化 Exchange');
        }
    }

    // 發送訊息至指定的 Exchange
    public async publish(exchangeName: string, msg: string): Promise<any> {
        if (this.channel) {
            try {
                // 確保 Exchange 已存在
                await this.channel.assertExchange(exchangeName, 'fanout', { durable: false });
                this.channel.publish(exchangeName, '', Buffer.from(msg));
                console.log(`訊息已發送至 Exchange [${exchangeName}]: ${msg}`);
                return { status: 'success', msg: '訊息已成功發送' };
            } catch (err) {
                return { status: 'error', msg: err, type: 'exchange' };
            }
        } else {
            return { status: 'error', msg: 'Channel 未建立，無法發送訊息', type: 'channel' };
        }
    }

    // 訂閱指定的 Exchange
    public async subscribe(exchangeName: string, onMessage: (msg: string, io: any) => void): Promise<void> {
        if (this.channel) {
            console.log(`開啟 MQ 訂閱於 Exchange: ${exchangeName}`);
            // 確保 Exchange 已存在
            await this.channel.assertExchange(exchangeName, 'fanout', { durable: false });
            // 建立臨時 Queue
            const q = await this.channel.assertQueue('', { exclusive: true });
            // 綁定 Queue 到 Exchange
            await this.channel.bindQueue(q.queue, exchangeName, '');
            // 消費 Queue 中的訊息
            await this.channel.consume(q.queue, (msg: any) => {
                if (msg) {
                    onMessage(msg.content.toString(), io);
                    this.channel?.ack(msg);
                }
            });
        } else {
            throw new Error('Channel 未建立，無法訂閱訊息');
        }
    }
}

// 在匯入時初始化實例
export const $MQ = RabbitMQ.getInstance('amqp://localhost');