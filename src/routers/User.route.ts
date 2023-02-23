import { getConversationsByUser } from '@controllers/Conversation.controller'
import { createNewToken, getProfile, login, register, logout, getFriends, updateOnlineStatus, getOnlineFriends } from '@controllers/User.controller'
import authenticate from '@middlewares/auth.middleware'
import express, { Router } from 'express'

const userRouter: Router = express.Router()

userRouter.post("/register", register)
userRouter.post("/login", login)
userRouter.post("/refresh-token", createNewToken)
userRouter.get("/profile", authenticate(), getProfile)
userRouter.post("/logout", authenticate(), logout)
userRouter.put("/online-status", authenticate(), updateOnlineStatus)

userRouter.get('/friends', authenticate(), getFriends);

// Định nghĩa api lấy danh sách cuộc trò chuyện của một user
userRouter.get('/conversations', authenticate(), getConversationsByUser);

userRouter.get("/users/friends/online", authenticate(), getOnlineFriends);


export default userRouter