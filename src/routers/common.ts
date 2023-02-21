import express, { Router, Request, Response } from 'express'

const commonRouter: Router = express.Router()

commonRouter.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
        message: "Welcome to my chat api!"
    })
})


export default commonRouter