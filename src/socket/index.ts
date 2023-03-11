import jwt from 'jsonwebtoken';
import { IConversation } from '@models/Conversation'
import User, { IUser } from '@models/User'
import { IMessageData } from '@queues/processor'
// import { messagesQueue } from '@queues/queue'
import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { JwtPayload } from '@helpers/createToken';
import dotenv from 'dotenv'
import { ExtendedError } from 'socket.io/dist/namespace';
import messageHandler, { handleSendMessage } from './messageHandler';
import Friend from '@models/Friend';
dotenv.config()

/**
 * Authenticate socket fnc
 * @param socket 
 * @param next 
 * @returns 
 */
const authenticateSocket = (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {

    if (!socket.request.headers.cookie) return next(new Error("Unauthorized"))

    let objCookies: { [key: string]: string } = {}

    socket.request.headers.cookie.split("; ").forEach(cookie => {
        let splitCookie = cookie.split("=")
        objCookies[splitCookie[0]] = splitCookie[1]
    })

    const access_token = objCookies[`auth.access_token`]
    const refresh_token = objCookies[`auth.refresh_token`]
    if (!access_token && refresh_token) return next(new Error("Unauthorized"))

    try {
        let decoded = jwt.verify(access_token, process.env.JWT_SECRET_KEY!) as JwtPayload
        socket.data.auth = decoded
        return next()
    } catch (error) {
        if (access_token && !refresh_token) {
            return next(new Error("Unauthorized"))
        }
        return next(new Error("Invalid token"))
    }

}

const notifyFriendOnline = async (socket: Socket, onlineState: string, onlineUsers: { [key: string]: any }) => {

    // notify to friends
    let friends = await Friend.find({
        user: socket.data.auth.id
    }).populate({
        path: "friend",
        select: "_id first_name last_name email online_status",
        match: { online_status: "online" }
    })


    if (!friends || friends.length <= 0) return

    let listFriendRooms = friends.filter(item => item.friend !== null).map(item => onlineUsers[item.friend._id.toString()] && onlineUsers[item.friend._id.toString()].socketId)

    if (listFriendRooms.length <= 0) return
    socket.to(listFriendRooms).emit("friend_online", { userId: socket.data.auth.id, onlineState })
}



let io: Server
const onlineUsers: { [key: string]: any } = {}

const socketInit = async (httpServer: HttpServer) => {
    // create socket server
    io = new Server(httpServer, {
        cookie: true,
        cors: {
            origin: ["*", "http://localhost:3000"],
            credentials: true
        }
    })

    // add authenticateMiddleware
    io.use(authenticateSocket)

    // register connection event
    io.on("connection", async (socket) => {

        // add user to list online user
        let currUser = onlineUsers[socket.data.auth.id]
        if (!currUser) {
            onlineUsers[socket.data.auth.id] = {
                socketId: socket.id,
                isOnline: true
            }

            // get user and  update online status
            let user = await User.findOneAndUpdate({ _id: socket.data.auth.id }, { $set: { online_status: "online" } }, { new: true })
            socket.emit("update_onlineStatus", "online", socket.id)
            notifyFriendOnline(socket, "online", onlineUsers)
        }

        onlineUsers[socket.data.auth.id] = {
            socketId: socket.id,
            isOnline: true
        }

        //register disconnect event
        socket.on("disconnect", async () => {
            if (onlineUsers[socket.data.auth.id]) {
                onlineUsers[socket.data.auth.id].isOnline = false
            }

            setTimeout(async () => {
                if (onlineUsers[socket.data.auth.id] && !onlineUsers[socket.data.auth.id].isOnline) {
                    console.log("update offline")
                    await User.updateOne({ _id: socket.data.auth.id }, {
                        $set: {
                            online_status: "offline",
                            last_online: Date.now()
                        }
                    })
                    delete onlineUsers[socket.data.auth.id]
                    notifyFriendOnline(socket, "offline", onlineUsers)
                }

            }, 5000)

        });

        messageHandler(socket)


    })
    return io;
}

export {
    io,
    onlineUsers
}
export default socketInit;