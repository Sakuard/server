import { Router, Request, Response } from "express";
const serviceRouter = Router();
import { $redis } from '../redis';
import { v4 as uuidv4 } from 'uuid';
import * as $z from '../schema/check';
import { $MQ } from '../rabbitmq';

export const chatData = new Map<string, any>();
const roomMatch = async (room: string) => {
    const matchRoom = await $redis.get(room);
    if (matchRoom === null) {
        const roomMatch = uuidv4();
        await $redis.set(room, roomMatch);
        return roomMatch;
    } else {
        await $redis.del(room);
        return matchRoom;
    }
};

serviceRouter.get('/status/v1', (req: Request, res: Response) => {
    res.send("Service running well.");
});

serviceRouter.post('/user/match/v1', async (req: Request, res: Response) => {
    const { userid, chatroom } = $z.SocketClient.parse(req.body);
    let matchRoom = chatData.get(userid) === null ? await roomMatch(chatroom) : chatData.get(userid);
    if (chatData.get(userid) === null) {
        chatData.set(userid, matchRoom);
    }

    res.send({
        "status": "success",
        "matchRoom": matchRoom
    });
});

serviceRouter.post('/user/chat/v1', async (req: Request, res: Response) => {
    // 發送訊息至指定的 Exchange
    const { chatroom, msg } = $z.SocketServer_ClientMsg.parse(req.body);
    let result = await $MQ.publish(chatroom, msg);
    if (result.status === 'error') {
        res.send({ status: 'error', msg: '訊息發送失敗' });
    } else {
        res.send({ status: 'success', msg: '訊息已成功發送' });
    }
});

export default serviceRouter;