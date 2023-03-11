import { IUser } from './User';
import mongoose, { Document } from 'mongoose';
import { IConversation } from './Conversation';
import paginate from 'mongoose-paginate-v2';
export interface IMessage extends Document {
    conversation: IConversation["_id"];
    sender: IUser["_id"];
    content: string;
    contentType: "image" | "text" | "file"
    fileUrl?: string
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
    },
    contentType: {
        type: String,
        enum: ["image", "text", "file"],
        required: true,
        default: "text"
    },
    fileUrl: {
        type: String,
        required: false
    }
}, { timestamps: true });

messageSchema.index({
    createAt: -1, conversation: 1
})
messageSchema.plugin(paginate)
const Message = mongoose.model<IMessage, mongoose.PaginateModel<IMessage>>('Message', messageSchema);

export default Message

