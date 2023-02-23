import { IMessageData } from '@queues/processor';
import { messagesQueue } from '@queues/queue';
import { Socket } from 'socket.io';


export const handleSendMessage = async ({ conversation, message, sender }: IMessageData) => {
    // add tin nhắn vào queue
    messagesQueue.add({
        conversation,
        sender,
        message
    })
}

const messageHandler = async (socket: Socket) => {

    // đăng ký sự kiện gửi tin nhắn
    socket.on("sendMessage", handleSendMessage);

    // Đăng ký sự kiện để join vào conversation
    socket.on("joinConversation", ({ conversationId }) => {
        socket.join(conversationId);
    });

    // Đăng ký sự kiện để leave conversation
    socket.on("leaveConversation", ({ conversationId }) => {
        socket.leave(conversationId);
    });
}

export default messageHandler