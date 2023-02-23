import express, { Express } from 'express';
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
dotenv.config()

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 100, // Giới hạn 100 requests trong 1 phút
    message: "Exceeded request limit. Please try again after a short period of time.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const serverConfig = (app: Express) => {
    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
    app.use(limiter)
}

export default serverConfig