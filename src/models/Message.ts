import { IUser } from './User';
import mongoose, { Document } from 'mongoose';
import { IConversation } from './Conversation';
import paginate from 'mongoose-paginate-v2';
export interface IMessage extends Document {
    conversation: IConversation["_id"];
    sender: IUser["_id"];
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
    conversation: {
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

messageSchema.plugin(paginate)
const Message = mongoose.model<IMessage, mongoose.PaginateModel<IMessage>>('Message', messageSchema);

export default Message

