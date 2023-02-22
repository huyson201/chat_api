import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express"
import { JwtPayload } from '@helpers/createToken';
import dotenv from 'dotenv'
import createHttpError from 'http-errors';
dotenv.config()


export interface AuthOptions {
    getTokenFromRequest: (req: Request) => string | undefined
    jwtVerify: (token: string, secret: string) => JwtPayload | null,
    tokenSecret: string
}

export const authOptions: AuthOptions = {
    getTokenFromRequest(req) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        return token
    },
    jwtVerify(token, secret) {
        try {
            let decoded = jwt.verify(token, secret) as JwtPayload
            return decoded
        } catch (error) {
            return null
        }

    },
    tokenSecret: process.env.JWT_SECRET_KEY || ''

}


const authenticate = () => {
    let options = authOptions

    return async (req: Request, res: Response, next: NextFunction) => {
        let token = options.getTokenFromRequest(req)
        if (!token) return next(createHttpError(401, "Unauthorized"))

        try {
            let decode = options.jwtVerify(token, options.tokenSecret)
            if (!decode) return next(createHttpError(401, "Unauthorized"))

            let user = decode

            req.user = user
            return next()
        } catch (error) {
            return next(createHttpError(500, "Server error...!"))
        }
    }

}

export default authenticate