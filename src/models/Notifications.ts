import { Schema, model, Document, Types, SchemaTypes } from 'mongoose';
import { IUser } from './User';

// Định nghĩa interface cho document của collection "notifications"
export interface INotificationDocument extends Document {
    recipient: IUser["_id"];
    sender: IUser["_id"];
    message: string;
    createdAt: Date;
    updatedAt: Date;
    type: 'friend_request' | 'friend_request_accepted' | 'friend_request_rejected';
}

// Định nghĩa schema cho collection "notifications"
const NotificationSchema = new Schema<INotificationDocument>({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['friend_request', 'friend_request_accepted', 'friend_request_rejected'],
        required: true,
        default: 'friend_request'

    }
}, { timestamps: true });

// Tạo model từ schema
const NotificationModel = model<INotificationDocument>('Notification', NotificationSchema);

export default NotificationModel
