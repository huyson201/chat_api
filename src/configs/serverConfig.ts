import express, { Express } from 'express';
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
dotenv.config()
const serverConfig = (app: Express) => {
    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

export default serverConfig