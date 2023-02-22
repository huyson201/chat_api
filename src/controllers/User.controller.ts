import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express"
import bcrypt from 'bcrypt';
import User from "@models/User";
import createToken from "@helpers/createToken";
import createResponse from "@helpers/createResponse";
import createHttpError from "http-errors";
import dotenv from 'dotenv'

dotenv.config()

/**
 * Register account
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const register = async (req: Request, res: Response, next: NextFunction) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        // Kiểm tra xem email đã được đăng ký chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(createHttpError(400, 'User with this email already exists'))
        }

        // Tạo người dùng mới
        const newUser = new User({ first_name, last_name, email, password: password });
        await newUser.save();

        // Tạo token và gửi lại client
        const token = createToken(newUser);
        newUser.token = token.refresh_token
        await newUser.save()

        res.json(createResponse("Created!", true, { ...newUser.toJSON(), ...token }));

    } catch (error: any) {
        console.log(error)
        return next(createHttpError(500, "server error..."))
    }



}


/**
 * user login
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {

        // Tìm người dùng với email
        const user = await User.findOne({ email });
        if (!user) {
            return next(createHttpError(400, 'User with this email does not exist'))
        }

        // Kiểm tra mật khẩu
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return next(createHttpError(400, 'Invalid password'))
        }

        // Tạo token và gửi lại client
        const token = createToken(user);

        // save token
        user.token = token.refresh_token
        await user.save()

        res.json(createResponse("Login success!", true, { ...user.toJSON(), ...token }));
    } catch (error: any) {
        console.log(error.message);
        return next(createHttpError(500, "server error...!"))
    }
}

/**
 * Create new token
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const createNewToken = async (req: Request, res: Response, next: NextFunction) => {
    const { refresh_token } = req.body;

    try {

        // Verify the refresh token
        const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET_KEY!) as { id: string, email: string };

        // Check if the user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(createHttpError(401, 'User not found'))
        }


        // Check if the refresh token is still valid
        if (user.token !== refresh_token) {
            return next(createHttpError(401, 'Invalid refresh token'))
        }

        // Generate a new access token
        const token = createToken(user)

        user.token = token.refresh_token
        await user.save()

        return res.status(200).json(createResponse("Create new token success!", true, { ...token }));
    } catch (err) {
        console.error(err);
        return next(createHttpError(401, 'Invalid refresh token'))
    }
}


/**
 * get user profile
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const getProfile = async (req: Request, res: Response, next: NextFunction) => {

    try {
        if (!req.user) return next(createHttpError(401, 'Unauthorized'))
        let { id } = req.user
        let user = await User.findById(id)
        if (!user) return next(createHttpError(404, "User not found!"))

        return res.status(200).json(createResponse("success", true, { ...user.toJSON() }))

    } catch (error) {
        console.log(error)
        return next(createHttpError(500, 'Server error...!'))
    }
}

/**
 *  logout function
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return next(createHttpError(401, 'Unauthorized'))

        let { id } = req.user
        let user = await User.findById(id)
        if (!user) return next(createHttpError(404, "User not found!"))

        user.token = ''
        await user.save()
        return res.status(200).json(createResponse("Logout success!", true))
    }
    catch (error: any) {
        console.log(error)
        return next(createHttpError(500, 'Server error...!'))
    }
}


const getFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return next(createHttpError(401, "Unauthorized"))
        const userId = req.user.id;

        const user = await User.findById(userId).populate({
            path: "friends",
            select: "_id first_name last_name avatar_url online_status",
            options: {
                sort: { online_status: -1 }
            }
        });
        if (!user) {
            return next(createHttpError(404, "User not found"))
        }

        return res.status(200).json(createResponse("Get friends success", true, user.friends))
    } catch (error) {
        console.error(error);
        return next(createHttpError(500, 'Internal server error'))

    }
}

const updateOnlineStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return next(createHttpError(401, "Unauthorized"))
        const user = await User.findById(req.user.id);

        if (!user) {
            return next(createHttpError(404, "User not found"));
        }

        user.online_status = req.body.online_status;

        const updatedUser = await user.save();

        return res.send(updatedUser);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Server error' });
    }
}




export {
    register,
    login,
    createNewToken,
    getProfile,
    logout,
    getFriends,
    updateOnlineStatus
}