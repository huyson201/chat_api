import { IConversation } from '@models/Conversation';
import Message from '@models/Message';
import NotificationModel from '@models/Notifications';
import { IUser } from '@models/User';

import { Job, DoneCallback } from "bull"
import { io } from '@socket/index';

export interface INotificationsData {
    recipient: IUser["_id"]
    sender: IUser["_id"]
    message: string
}

export interface IMessageData {
    conversation: IConversation["_id"],
    message: string,
    sender: IUser['_id']
}

const notificationsProcessor = async (job: Job<INotificationsData>, done: DoneCallback) => {
    try {
        await NotificationModel.create({
            recipient: job.data.recipient,
            sender: job.data.sender,
            message: job.data.message,
        });
        console.log(`Sending notification to ${job.data.recipient}`);
        done()
    } catch (error) {
        // or give an error if error
        done(new Error('server error...!'));

    }
}

const messageProcessor = async (job: Job<IMessageData>, done: DoneCallback) => {
    // Tạo một tin nhắn mới
    const newMessage = new Message({
        conversation: job.data.conversation,
        sender: job.data.sender,
        content: job.data.message,
    });

    // Lưu tin nhắn vào database
    const savedMessage = await newMessage.save();

    // Gửi tin nhắn tới các client đang trong conversation
    io.to(job.data.conversation).emit("receiveMessage", {
        message: savedMessage,
        conversation: job.data.conversation,
    });
}

export {
    notificationsProcessor,
    messageProcessor
}