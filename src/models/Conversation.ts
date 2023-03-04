import paginate from 'mongoose-paginate-v2';
import { IUser } from './User';
import mongoose, { Document } from 'mongoose';
import { IMessage } from './Message';

export interface IConversation extends Document {
    name: string;
    creator: IUser["_id"];
    members: IUser["_id"][]
    is_group: boolean,
    lastMessage?: IMessage["_id"]
    createdAt: Date,
    updatedAt: Date,
}

const conversationSchema = new mongoose.Schema<IConversation>({
    name: {
        type: String,
        required: false,
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
    members: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    ],
    lastMessage: {
        type: mongoose.Types.ObjectId,
        ref: "Message",
        sparse: true
    }
}, { timestamps: true });

conversationSchema.index({ creator: 1, members: 1, updatedAt: -1 })

conversationSchema.plugin(paginate)
const Conversation = mongoose.model<IConversation, mongoose.PaginateModel<IConversation>>(
    'Conversation',
    conversationSchema
);

export default Conversation
