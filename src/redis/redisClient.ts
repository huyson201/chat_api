import Redis from 'ioredis'
import dotenv from 'dotenv'
dotenv.config()
const redisUrl = process.env.REDIS_URL2!
const redisClient = new Redis(redisUrl, {
    enableReadyCheck: false,
    maxRetriesPerRequest: null
})

redisClient.on("connect", () => {
    console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
    console.error("Redis connection error", err);
});


export default redisClient