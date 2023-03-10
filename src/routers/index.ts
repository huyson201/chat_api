import { Express } from 'express';
import commonRouter from './common';
import userRouter from './User.route';
import friendRouter from './Friend.route';
import conversationRouter from './Conversation.route';
import messageRouter from './Message.route';
import authRouter from './auth.route';

const router = (app: Express) => {
    app.use("/", commonRouter)
    app.use("/api/users/", userRouter)
    app.use("/api/friends/", friendRouter)
    app.use("/api/conversations", conversationRouter)
    app.use("/api/messages", messageRouter)
    app.use("/api/auth", authRouter)
}


export default router;