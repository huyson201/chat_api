import { IMessageData } from '@queues/processor';
// import { messagesQueue } from '@queues/queue';
import { Socket } from 'socket.io';
import { io, onlineUsers } from "./index"
import Conversation, { IConversation } from '@models/Conversation';
import Message from '@models/Message';

export const handleSendMessage = async ({ conversation, message, sender, to }: IMessageData) => {

    let msg = new Message({
        conversation: conversation._id,
        sender: sender._id,
        content: message

    })
    await msg.save()

    if (!Array.isArray(to)) {

    }

    // add tin nhắn vào queue
    // messagesQueue.add({
    //     conversation,
    //     sender,
    //     message
    // })
}

const messageHandler = async (socket: Socket) => {

    // đăng ký sự kiện gửi tin nhắn
    socket.on("sendMessage", async ({ conversation, fileUrl, contentType, message, sender, to }: IMessageData) => {

        let msg = new Message({
            conversation: conversation._id,
            sender: sender._id,
            content: message,
            contentType,
            fileUrl

        })
        await msg.save()

        await Conversation.updateOne({
            _id: conversation._id
        }, {
            $set: { lastMessage: msg._id }
        })

        msg.sender = sender

        console.log("sendMessage_____")

        if (!Array.isArray(to)) {
            let sendTo = [socket.id]
            if (onlineUsers[to._id]) sendTo.push(onlineUsers[to._id])
            io.emit("receiveMessage", { ...msg.toJSON(), sender: sender }, sendTo)

        }
        else {
            io.to(conversation._id).emit("receiveMessage", msg)
        }
        // add tin nhắn vào queue
        // messagesQueue.add({
        //     conversation,
        //     sender,
        //     message
        // })
    });

    // Đăng ký sự kiện để join vào conversation
    socket.on("joinConversation", (conversation: IConversation) => {
        socket.join(conversation._id);
        console.log("joinRoom: " + conversation._id)
    });

    // Đăng ký sự kiện để leave conversation
    socket.on("leaveConversation", (conversation: IConversation) => {
        socket.leave(conversation._id);
        console.log("leaveRoom: " + conversation._id)

    });
}

export default messageHandler