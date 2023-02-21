import serverConfig from '@configs/serverConfig';
import createResponse from '@helpers/createReponse';
import express, { Express, Request, Response, ErrorRequestHandler, NextFunction } from "express";
import http from 'http'
import connectDb from "./database";
import router from './routers';

const app: Express = express()
const server: http.Server = http.createServer(app)
const PORT = process.env.PORT || 4000

// configs server
serverConfig(app)

// configs router

router(app)

// Handle errors.
const errorHandle: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500)
    res.json(createResponse(err.message, false, null));

}
app.use(errorHandle);



connectDb().then(() => {
    server.listen(PORT, () => {
        console.log("Server running on port: " + PORT);
    })
})

