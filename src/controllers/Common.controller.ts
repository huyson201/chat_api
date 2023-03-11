import createResponse from "@helpers/createResponse"
import logger from "@helpers/logger"
import { uploadToCloud } from "cloudinary/init"
import { NextFunction, Request, Response } from "express"
import fs from 'fs'
import createHttpError from "http-errors"
const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(createHttpError(404, "File not found"))

    try {
        let data = await uploadToCloud(req.file)
        console.log(data)
        return res.status(200).json(createResponse("upload success", true, {
            fileUrl: data.url,
            original_filename: data.original_filename,
            resource_type: data.resource_type,
            filename: req.file.originalname,
            format: data.format
        }))
    } catch (error) {
        fs.unlinkSync(req.file.path)
        logger.error(error)
        return next(createHttpError(500, "server error"))
    }


}

export {
    uploadFile
}