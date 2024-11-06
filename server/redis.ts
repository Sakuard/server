import { createClient } from 'redis'

export const $redis = createClient({
    url: 'redis://:qpWnygFMUh@localhost:6379'
})

const redisConnection = async () => {
    $redis.on('error', (err: any) => console.log(`Redis connection error: `, err));

    try {
        await $redis.connect();
        console.log('Redis connected');
    } catch (err: any) {
        console.error('Connection or operation error:', err);
    }
}

redisConnection()