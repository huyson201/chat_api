// import Queue from 'bull'
// import dotenv from 'dotenv'
// import { IMessageData, INotificationsData, messageProcessor, notificationsProcessor } from './processor'
// import { ExpressAdapter, BullAdapter, createBullBoard } from '@bull-board/express'
// import redisClient from '@redis/redisClient'

// dotenv.config()


// // create notifications queue and add processor
// const notificationsQueue = new Queue<INotificationsData>('sendNotifications', process.env.REDIS_URL!, {
//     defaultJobOptions: {
//         removeOnComplete: {
//             age: 1000 * 60 * 5,
//         },
//         removeOnFail: {
//             age: 1000 * 60 * 5,
//         }
//     }
// })

// notificationsQueue.process(notificationsProcessor)


// // create message queue
// const messagesQueue = new Queue<IMessageData>("sendMessage", process.env.REDIS_URL2!, {
//     redis: {
//         tls: {},
//     },
//     defaultJobOptions: {
//         removeOnComplete: {
//             age: 1000 * 60 * 5,

//         },
//         removeOnFail: {
//             age: 1000 * 60 * 5
//         },

//     }
// })

// messagesQueue.process(messageProcessor)


// const serverAdapter = new ExpressAdapter()
// serverAdapter.setBasePath('/queues');

// createBullBoard({
//     queues: [new BullAdapter(notificationsQueue), new BullAdapter(messagesQueue)],
//     serverAdapter
// });


// export {
//     notificationsQueue,
//     messagesQueue,
//     serverAdapter
// }
export { }