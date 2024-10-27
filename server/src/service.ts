import { Router, Request, Response } from "express";
const serviceRouter = Router();

serviceRouter.get('/status', (req: Request, res: Response) => {
    res.send("Service running well.");
})

export default serviceRouter;