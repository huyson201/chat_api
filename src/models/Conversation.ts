import { IUser } from './User';
import mongoose,  {Document} from 'mongoose';

export interface IConversation extends Document{
    name: string;
    creator: IUser["_id"];
    is_group: boolean,
    createdAt: Date,
    updatedAt: Date
}

const conversationSchema = new mongoose.Schema<IConversation>({
    name: {
        type: String,
        required: true,
    },
    is_group: {
        type: Boolean,
        required: false,
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export const ConversationModel = mongoose.model<IConversation>(
    'Conversation',
    conversationSchema
);
