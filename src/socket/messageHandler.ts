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
    socket.on("sendMessage", async ({ conversation, message, sender, to }: IMessageData) => {

        let msg = new Message({
            conversation: conversation._id,
            sender: sender._id,
            content: message
        })
        await msg.save()

        await Conversation.updateOne({
            _id: conversation._id
        }, {
            $set: { lastMessage: msg._id }
        })

        msg.sender = sender

        console.log("sendMessage_____")

        if (!Array.isArray(to) && onlineUsers[to._id]) {
            io.to([onlineUsers[to._id].socketId, socket.id]).emit("receiveMessage", msg)
            console.log("emit receiveMessage")
        }
        else {
            io.to(conversation._id).emit("receiveMessage", message)
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
    });

    // Đăng ký sự kiện để leave conversation
    socket.on("leaveConversation", (conversation: IConversation) => {
        socket.leave(conversation._id);
    });
}

export default messageHandler