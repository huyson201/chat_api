import dotenv from 'dotenv';
import { IUser } from "@models/User";
import jwt from 'jsonwebtoken';

dotenv.config()

export interface JwtPayload {
    id: string,
    email: string
}


const createToken = (user: JwtPayload | IUser) => {
    let payload: JwtPayload = { id: user.id, email: user.email }

    let access_token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: '24h' });
    let refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY!, { expiresIn: '365d' });

    return {
        access_token,
        refresh_token
    }

}

export default createToken;