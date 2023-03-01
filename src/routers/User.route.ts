import { getConversations } from '@controllers/Conversation.controller'
import { getProfile, logout, getFriends, updateOnlineStatus, getOnlineFriends } from '@controllers/User.controller'
import authenticate from '@middlewares/auth.middleware'

import express, { Router } from 'express'
import passport from 'passport'

const userRouter: Router = express.Router()


userRouter.put("/online-status", authenticate(), updateOnlineStatus)

userRouter.get('/friends', authenticate(), getFriends);

// Định nghĩa api lấy danh sách cuộc trò chuyện của một user
userRouter.get('/conversations', passport.authenticate("jwt", { session: false }), getConversations);

userRouter.get("/users/friends/online", authenticate(), getOnlineFriends);


export default userRouter