import createResponse from '@helpers/createResponse';
import logger from '@helpers/logger';
import Conversation from '@models/Conversation';
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
    const { creator_id, members } = req.body;
    if (!Array.isArray(members) || members.length <= 0) {
        return next(createHttpError(400, "Members required."))
    }
    try {
        // Find creator user
        const creatorUser = await User.findById(creator_id);
        if (!creatorUser) {
            return res.status(400).json({ message: 'Creator user not found.' });
        }

        // Create new conversation object
        const conversation = new Conversation({
            name: req.body.name,
            is_group: req.body.is_group || false,
            creator: creatorUser._id,
            members: members,
        });

        // Save conversation to database
        await conversation.save();

        return res.status(200).json(createResponse("Create conversation successfully.", true, conversation));
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
const getConversationsByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return next(createHttpError(401, "Unauthorized"))
        const userId = req.user.id;

        // Tìm kiếm user trong database bằng id
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Tìm kiếm các cuộc trò chuyện liên quan đến user này
        const conversations = await Conversation.find({ members: userId }).populate('members', ['first_name', 'last_name', 'avatar_url']);
        res.status(200).json(createResponse("Get conversation successfully", true, conversations));

    } catch (error) {
        logger.error(error)

        return next(createHttpError(500, "Server error!"))

    }
}

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
export {
    createConversation,
    updateMembers,
    getConversationsByUser,
    delMember
}