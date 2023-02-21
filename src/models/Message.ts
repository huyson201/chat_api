import { IUser } from './User';
import mongoose, { Document } from 'mongoose';
import { IConversation } from './Conversation';

export interface IMessage extends Document {
    conversationId: IConversation["_id"];
    sender: IUser["_id"];
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
    conversationId: {
        type: mongoose.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export const MessageModel = mongoose.model<IMessage>('Message', messageSchema);

