import createResponse from '@helpers/createResponse';
import logger from '@helpers/logger';
import Conversation from '@models/Conversation';
import Message from '@models/Message';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import mongoose, { isValidObjectId } from 'mongoose';

/**
 * create a message
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const createMessage = async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId, content } = req.body;
    if (!req.user) {
        return next(createHttpError(401, "Unauthorized"))
    }

    const sender = req.user.id
    try {
        // Create new message
        const message = new Message({
            conversation: conversationId,
            sender,
            content
        });

        // Save message to the database
        await message.save();

        // Send response with created message
        return res.status(201).json(createResponse("Create message successfully.", true, message));
    } catch (error) {
        // Handle errors
        logger.error(error)

        return next(createHttpError(500, "server error."))
    }
}


const getMessageList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { conversationId } = req.params
        // const { page, limit } = req.query;

        // kiểm tra user
        if (!req.user) {
            return next(createHttpError(401, 'Unauthorized'))
        }

        // Tìm kiếm và phân trang tin nhắn
        const result = await Message.find({ conversation: conversationId }).populate({
            path: "sender",
            select: "first_name last_name email online_status last_online"
        })

        // Trả về kết quả
        return res.status(200).json(createResponse("success", true, result));
    } catch (error) {
        logger.error(error)
        return next(createHttpError(500, 'Internal server error'))
    }
};



export {
    createMessage,
    getMessageList
}