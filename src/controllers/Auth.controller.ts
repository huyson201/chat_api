import addTokenToCookies from "@helpers/addTokenToCookie";
import createToken from "@helpers/createToken";
import User, { IUser } from "@models/User";
import { Request, Response } from "express";

export const handleGoogleCallback = async (req: Request, res: Response) => {
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
        addTokenToCookies(res, token)
        // redirect to client
        return res.status(300).redirect("http://localhost:3000")
    } catch (error) {
        return res.redirect("/api/auth/google/fail")
    }
}