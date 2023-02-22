import NotificationModel from '@models/Notifications';
import { IUser } from '@models/User';

import { Job, DoneCallback } from "bull"

export interface INotificationsData {
    recipient: IUser["_id"]
    sender: IUser["_id"]
    message: string
}

const notificationsProcessor = async (job: Job<INotificationsData>, done: DoneCallback) => {
    try {
        await NotificationModel.create({
            recipient: job.data.recipient,
            sender: job.data.sender,
            message: job.data.message,
        });
        console.log(`Sending notification to ${job.data.recipient}`);
        done()
    } catch (error) {
        // or give an error if error
        done(new Error('server error...!'));

    }
}

export {
    notificationsProcessor
}