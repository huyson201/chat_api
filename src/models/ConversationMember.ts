import { IUser } from './User';
import mongoose, { Document, Schema } from "mongoose";
import { IConversation } from './Conversation';


export interface IConversationMember extends Document {
    user: IUser["_id"]
    conversation: IConversation["_id"],
    createdAt: Date,
    updatedAt: Date
}

const ConversationMemberSchema = new Schema<IConversationMember>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    conversation: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Conversation"
    }
}, { timestamps: true });




export const conversationMember = mongoose.model<IUser>('User', ConversationMemberSchema);
