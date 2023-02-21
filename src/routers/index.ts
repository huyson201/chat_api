import { Express } from 'express';
import commonRouter from './common';
import userRouter from './User.route';

const router = (app: Express) => {
    app.use("/", commonRouter)
    app.use("/users/", userRouter)
}


export default router;