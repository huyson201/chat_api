import paginate from 'mongoose-paginate-v2';
import { IUser } from './User';
import mongoose, { Document } from 'mongoose';

export interface IConversation extends Document {
    name: string;
    creator: IUser["_id"];
    members: IUser["_id"][]
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
    members: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ]
}, { timestamps: true });

conversationSchema.plugin(paginate)
const Conversation = mongoose.model<IConversation, mongoose.PaginateModel<IConversation>>(
    'Conversation',
    conversationSchema
);

export default Conversation
