import { getConversations } from '@controllers/Conversation.controller'
import {
    getFriends,
    updateOnlineStatus,
    getOnlineFriends,
    getGroups,
    getRequestFriends,
    findByEmail
} from '@controllers/User.controller'
import authenticate from '@middlewares/auth.middleware'

import express, { Router } from 'express'
import passport from 'passport'

const userRouter: Router = express.Router()


userRouter.put("/online-status", authenticate(), updateOnlineStatus)

userRouter.get("/find", passport.authenticate("jwt", { session: false }), findByEmail)

userRouter.get('/friends', passport.authenticate("jwt", { session: false }), getFriends);
userRouter.get('/groups', passport.authenticate("jwt", { session: false }), getGroups);
userRouter.get('/request-friends', passport.authenticate("jwt", { session: false }), getRequestFriends);

// Định nghĩa api lấy danh sách cuộc trò chuyện của một user
userRouter.get('/conversations', passport.authenticate("jwt", { session: false }), getConversations);

userRouter.get("/users/friends/online", authenticate(), getOnlineFriends);



export default userRouter