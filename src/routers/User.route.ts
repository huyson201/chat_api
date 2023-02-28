import { getConversationsByUser } from '@controllers/Conversation.controller'
import { getProfile, logout, getFriends, updateOnlineStatus, getOnlineFriends } from '@controllers/User.controller'
import authenticate from '@middlewares/auth.middleware'

import express, { Router } from 'express'

const userRouter: Router = express.Router()


userRouter.post("/logout", authenticate(), logout)
userRouter.put("/online-status", authenticate(), updateOnlineStatus)

userRouter.get('/friends', authenticate(), getFriends);

// Định nghĩa api lấy danh sách cuộc trò chuyện của một user
userRouter.get('/conversations', authenticate(), getConversationsByUser);

userRouter.get("/users/friends/online", authenticate(), getOnlineFriends);


export default userRouter