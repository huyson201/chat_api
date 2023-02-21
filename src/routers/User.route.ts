import { createNewToken, getProfile, login, register, logout } from '@controllers/User.controller'
import authenticate from '@middlewares/auth.middleware'
import express, { Router } from 'express'

const userRouter: Router = express.Router()

userRouter.post("/register", register)
userRouter.post("/login", login)
userRouter.post("/refresh-token", createNewToken)
userRouter.post("/profile", authenticate(), getProfile)
userRouter.post("/logout", authenticate(), logout)


export default userRouter