import { uploadFile } from '@controllers/Common.controller';
import createResponse from '@helpers/createResponse'
import logger from '@helpers/logger';
import express, { Router, Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors';
import { getLinkPreview } from "link-preview-js";
import multer from 'multer'

const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    storage: multer.diskStorage({
        destination(req, file, callback) {
            callback(null, './upload')
        },
        filename(req, file, callback) {
            callback(null, file.originalname)
        },
    })


})
const commonRouter: Router = express.Router()

commonRouter.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
        message: "Welcome to my chat api!"
    })
})

commonRouter.get("/api/link-review", async (req: Request, res: Response, next: NextFunction) => {
    const { url } = req.query
    if (!url) return res.status(200).json(createResponse("success", true, null))

    try {
        let data = await getLinkPreview((url as string), {
            imagesPropertyType: "og", // fetches only open-graph images
            headers: {
                "Accept-Language": "fr-CA",
                "user-agent": "googlebot",

            },
            timeout: 3000
        })

        return res.status(200).json(createResponse("success", true, data))
    } catch (error) {
        logger.error(error)
        return next(createHttpError(500, "server error"))
    }
})

commonRouter.post("/api/file-upload", upload.single("file"), uploadFile)

export default commonRouter