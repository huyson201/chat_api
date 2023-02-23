import jwt from 'jsonwebtoken';
import { IConversation } from '@models/Conversation'
import User, { IUser } from '@models/User'
import { IMessageData } from '@queues/processor'
import { messagesQueue } from '@queues/queue'
import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { JwtPayload } from '@helpers/createToken';
import dotenv from 'dotenv'
import { ExtendedError } from 'socket.io/dist/namespace';
import messageHandler, { handleSendMessage } from './messageHandler';
dotenv.config()

const authenticateSocket = (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
    let token = socket.handshake.auth.token
    if (!token) return next(new Error("Unauthorized"))

    try {
        let decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY!) as JwtPayload
        socket.data.user = decoded
        return next()
    } catch (error) {
        return next(new Error("Invalid token"))
    }
}

const notifyFriendOnline = (socket: Socket, userId: string, friends?: any[]) => {
    if (!friends || friends.length === 0) return
    friends.forEach(friend => {
        if (onlineUsers[friend._id]) {
            socket.to(onlineUsers[friend._id]).emit("friendOnline", { friendId: userId })
        }
    })
}

let io: Server
const onlineUsers: { [key: string]: string } = {}

const socketInit = async (httpServer: HttpServer) => {

    // create socket server
    io = new Server(httpServer, {
        cors: {
            origin: "*"
        }
    })

    // add authenticateMiddleware
    io.use(authenticateSocket)

    // register connection event
    io.on("connection", async (socket) => {

        // defined online status time out
        let onlineStatusTimeout: NodeJS.Timeout | null

        // get user
        let user = await User.findById(socket.data.user.id)
            .populate({
                path: "friends",
                match: { online_status: 'online' },
                select: "_id first_name last_name avatar_url online_status"
            })


        // update online status
        if (user) {
            user.online_status = 'online'
            await user.save()

            // notify  user online to friends  
            notifyFriendOnline(socket, user._id, user.friends)

        }


        // storage socket id
        onlineUsers[socket.data.user.id] = socket.id
        console.log("----user::connection----");
        console.log(onlineUsers)



        // handle chat message
        messageHandler(socket)

        // Đăng ký sự kiện để lắng nghe disconnect event
        socket.on("disconnect", async () => {
            delete onlineUsers[socket.data.user.id]

            onlineStatusTimeout = setTimeout(async () => {
                console.log("A user disconnected");
                if (user) {
                    user.online_status = "offline"
                    await user.save()
                }
            }, 10000)

        });

        // đăng ký sự kiện connect
        socket.on("connect", () => {
            // storage socket id
            onlineUsers[socket.data.user.id] = socket.id
            console.log("----user::connect----");
            console.log(onlineUsers);


            if (onlineStatusTimeout) {
                clearTimeout(onlineStatusTimeout);
                onlineStatusTimeout = null;
            }
        })


    })
    return io;
}

export {
    io
}
export default socketInit;