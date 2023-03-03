import serverConfig from '@configs/serverConfig';
import createResponse from '@helpers/createResponse';
import express, { Express, Request, Response, ErrorRequestHandler, NextFunction } from "express";
import http from 'http'
import connectDb from "./database";
import router from './routers';
// import { serverAdapter } from '@queues/queue';
import "@configs/passport";
import socketInit from './socket';

const app: Express = express()
const server: http.Server = http.createServer(app)
const PORT = process.env.PORT || 4000

// configs server
serverConfig(app)

// use bull-board
// app.use("/queues", serverAdapter.getRouter())

// configs router
router(app)

// init socket

// Handle errors.
const errorHandle: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let errors = err.errors || null
    res.status(err.status || 500)
    res.json(createResponse(err.message, false, null, errors));

}
app.use(errorHandle);



connectDb().then(() => {
    server.listen(PORT, () => {
        socketInit(server)
        console.log("Server running on port: " + PORT);
    })
})

