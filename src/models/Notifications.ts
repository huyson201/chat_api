import { Schema, model, Document, Types, SchemaTypes } from 'mongoose';

// Định nghĩa interface cho document của collection "notifications"
interface INotificationDocument extends Document {
    recipientId: Types.ObjectId;
    senderId: Types.ObjectId;
    message: string;
    createdAt: Date;
    updatedAt: Date;
    type: 'friend_request' | 'friend_request_accepted' | 'friend_request_rejected';
}

// Định nghĩa schema cho collection "notifications"
const NotificationSchema = new Schema<INotificationDocument>({
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderId: {
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

export { NotificationModel, INotificationDocument };
