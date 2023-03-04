import mongoose, { Schema, model, Document } from 'mongoose';
import { IUser } from './User';

import paginate from 'mongoose-paginate-v2'

export interface IFriend extends Document {
    user: IUser["_id"]
    friend: IUser["_id"]
    createdAt: Date
    updatedAt: Date
}

const friendSchema = new Schema<IFriend>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        friend: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);
friendSchema.index({
    user: 1, friend: 1
})
friendSchema.plugin(paginate)

const Friend = model<IFriend, mongoose.PaginateModel<IFriend>>('Friend', friendSchema);

export default Friend
