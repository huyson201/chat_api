import createResponse from '@helpers/createResponse';
import logger from '@helpers/logger';
import Conversation from '@models/Conversation';
import Friend from '@models/Friend';
import User from '@models/User';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';


/**
 * create a conversation
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const createConversation = async (req: Request, res: Response, next: NextFunction) => {
    const { members } = req.body;

    if (!req.user) return next(createHttpError(401, "Unauthorized"))
    try {
        // Find creator user


        // Create new conversation object
        const conversation = new Conversation({
            name: req.body.name,
            is_group: req.body.is_group || false,
            creator: req.user.id,
            members: members,
        });

        let [_, populateConversation] = await Promise.all([conversation.save(), conversation.populate([
            { path: 'creator', select: 'first_name last_name email avatar_url online_status' },
            { path: 'members', select: 'first_name last_name email avatar_url online_status' },
            { path: "lastMessage", select: "sender content" }
        ])])

        return res.status(200).json(createResponse("Create conversation successfully.", true, populateConversation));
    } catch (err) {
        logger.error(err)
        return next(createHttpError(500, "Server error!"))
    }
}

/**
 * if conversation is a group, update members of conversation by conversationId
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const updateMembers = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { members } = req.body;

    if (!Array.isArray(members) || members.length <= 0) {
        return next(createHttpError(400, "Members required."))
    }

    try {
        // Tìm cuộc trò chuyện bằng id
        const conversation = await Conversation.findById(id);

        // Nếu conversation không tồn tại hoặc không phải là nhóm thì trả về lỗi
        if (!conversation || !conversation.is_group) {
            return next(createHttpError(400, 'Conversation not found or not a group'))
        }

        // Cập nhật danh sách thành viên
        conversation.members = members;

        // Lưu thay đổi
        await conversation.save();

        // Trả về thông tin cuộc trò chuyện đã được cập nhật
        res.status(200).json(createResponse("Update successfully", true, conversation));

    } catch (error) {
        logger.error(error)

        return next(createHttpError(500, "Server error!"))

    }
}


/**
 * get conversation by user id
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const getConversations = async (req: Request, res: Response, next: NextFunction) => {


    if (!req.user) {
        return next(createHttpError(401, "Unauthorized"))
    }

    const userId = req.user.id;

    try {
        const conversations = await Conversation.find({
            $or: [{ creator: userId }, { members: userId }]
        })
            .populate([
                { path: 'creator', select: 'first_name last_name email avatar_url online_status' },
                { path: 'members', select: 'first_name last_name email avatar_url online_status' },
                { path: "lastMessage", select: "sender content" }
            ])
            .sort("-updatedAt")
            .lean()
        return res.status(200).json(createResponse("Get conversation successfully", true, conversations));
    } catch (error) {
        console.error(error);
        return next(createHttpError(500, "Server error"))
    }
};

/**
 * delete member of conversation
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const delMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { conversationId } = req.params;

        if (!req.user) {
            return next(createHttpError(401, 'Unauthorized'))
        }
        const { id: userId } = req.user;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return next(createHttpError(404, 'Conversation not found'))
        }

        if (!conversation.is_group) {
            return next(createHttpError(400, 'Cannot leave a one-on-one conversation'))

        }

        if (!conversation.members.includes(userId)) {
            return next(createHttpError(400, 'User is not a member of the conversation'))
        }

        let updatedConversation = await Conversation.findByIdAndUpdate(conversationId, { $pull: { members: userId } }, { new: true });
        return res.status(200).json(createResponse('User left conversation successfully', true, updatedConversation));
    } catch (error) {
        logger.error(error)
        return next(createHttpError(500, "Server error!"))
    }
}

const getConversation = async (req: Request, res: Response, next: NextFunction) => {
    let conversationId = req.params.conversationId

    try {
        let conversation = await Conversation.findById(conversationId, {
            populate: [
                { path: 'creator', select: 'first_name last_name email avatar_url online_status' },
                { path: 'members', select: 'first_name last_name email avatar_url online_status' },
                { path: "lastMessage" }
            ],
        })

        return res.status(200).json(createResponse("Get successfully", true, conversation))
    } catch (error) {
        logger.error(error)
        return next(createHttpError(500, "Server Error!"))
    }
}

export {
    createConversation,
    updateMembers,
    delMember,
    getConversations,
    getConversation
}