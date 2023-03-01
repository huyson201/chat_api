import User, { IUser } from '@models/User';
import { createNewToken, getProfile, login, logout, register } from '@controllers/User.controller';
import createToken from '@helpers/createToken';
import { handleParamsValidationErrors, loginValidation, registerValidation } from '@middlewares/paramsRules.middleware';
import express, { Router, Request, Response } from 'express'
import passport from 'passport';
import { handleGoogleCallback } from '@controllers/Auth.controller';

const authRouter: Router = express.Router()

authRouter.post("/register", registerValidation, handleParamsValidationErrors, register)
authRouter.post("/login", loginValidation, handleParamsValidationErrors, login)
authRouter.post("/refresh-token", createNewToken)
authRouter.post("/logout", passport.authenticate("jwt", { session: false }), logout)

authRouter.get("/profile", passport.authenticate("jwt", { session: false }), getProfile)

authRouter.get("/google/fail", (req: Request, res: Response) => {
    return res.status(400).json({
        message: "login fail"
    })
})

authRouter.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

authRouter.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/google/fail',
        session: false
    }), handleGoogleCallback);


export default authRouter