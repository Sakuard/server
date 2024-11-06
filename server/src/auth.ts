import { Router, Request, Response } from "express";
import * as $z from "../schema/check";
import * as $auth from "../auth";
const authRouter = Router();

authRouter.post('/service/user/v1', (req: Request, res: Response) => {
    try {
        const { username, role } = $z.JWT_Payload.parse(req.body)
        const token = $auth.createToken({
          username: username,
          role: role||'user'
        })
        res.status(200).send({"status": "success", "token": token})
    } catch (e:any) {
        console.log(`\n[WARN]\napi: /api/user/auth/v1\nerror: ${e}\n`)
        res.status(500).send({"status": "error", "msg": e})
    }
})

export default authRouter;