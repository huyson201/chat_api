import mongoose, { Document } from 'mongoose';
import { IUser } from './User';

export interface IFriend extends Document {
    user: IUser["_id"];
    friend: IUser["_id"];
    createdAt: Date,
    updatedAt: Date
}

const friendSchema = new mongoose.Schema<IFriend>({
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    friend: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    }

}, { timestamps: true });

export const FriendModel = mongoose.model<IFriend>('Friend', friendSchema);
