import User, { IUser } from '@models/User';
import { createNewToken, getProfile, login, register } from '@controllers/User.controller';
import createToken from '@helpers/createToken';
import { loginValidation, registerValidation } from '@middlewares/paramsRules.middleware';
import express, { Router, Request, Response } from 'express'
import passport from 'passport';

const authRouter: Router = express.Router()

authRouter.post("/register", registerValidation, register)
authRouter.post("/login", loginValidation, login)
authRouter.post("/refresh-token", createNewToken)

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
    }), async (req: Request, res: Response) => {
        // generate token....

        if (!req.user) {
            return res.redirect("/api/auth/google/fail")
        }

        const token = createToken(req.user)
        const user = <IUser>req.user
        try {
            if (user) {
                user.token = token.refresh_token
                await user.save()
            }
            else {
                await User.findOneAndUpdate({ email: req.user.email }, {
                    $set: {
                        token: token.refresh_token,
                    }
                })
            }
            res.cookie("auth.access_token", token.access_token, { httpOnly: true })
            res.cookie("auth.refresh_token", token.refresh_token, { httpOnly: true })
            // redirect to client
            return res.status(300).redirect("http://localhost:3000")
        } catch (error) {
            return res.redirect("/api/auth/google/fail")
        }
    });


export default authRouter