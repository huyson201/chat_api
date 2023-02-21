import { IUser } from './User';
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRequestFriend extends Document {
    requesterId: IUser["_id"];
    recipientId: IUser["_id"];
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

const RequestFriendSchema: Schema<IRequestFriend> = new Schema(
    {
        requesterId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipientId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        }
    },
    { timestamps: true }
);

const RequestFriend: Model<IRequestFriend> = mongoose.model(
    "RequestFriend",
    RequestFriendSchema
);

export default RequestFriend;
