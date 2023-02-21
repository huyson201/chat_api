import { IUser } from './User';
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRequestFriend extends Document {
    requester: IUser["_id"];
    recipient: IUser["_id"];
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

const RequestFriendSchema: Schema<IRequestFriend> = new Schema(
    {
        requester: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipient: {
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
