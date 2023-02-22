import Queue from 'bull'
import dotenv from 'dotenv'
import { INotificationsData, notificationsProcessor } from './processor'
import { ExpressAdapter, BullAdapter, createBullBoard } from '@bull-board/express'

dotenv.config()


// create notifications queue and add processor
const notificationsQueue = new Queue<INotificationsData>('sendNotifications', process.env.REDIS_URL!, {
    defaultJobOptions: {
        removeOnComplete: {
            age: 600,
            count: 10
        },
        removeOnFail: {
            age: 600,
            count: 10
        }
    }
})



notificationsQueue.process(notificationsProcessor)

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/queues');

createBullBoard({
    queues: [new BullAdapter(notificationsQueue)],
    serverAdapter
});


export {
    notificationsQueue,
    serverAdapter
}