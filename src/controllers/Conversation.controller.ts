import createResponse from '@helpers/createResponse';
import logger from '@helpers/logger';
import Conversation from '@models/Conversation';
import Friend from '@models/Fiend';
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
const getConversations = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, perPage = 10 } = req.query;

    if (!req.user) {
        return next(createHttpError(401, "Unauthorized"))
    }

    const userId = req.user.id;

    try {
        // Lấy danh sách conversations với paginate
        const conversations = await Conversation.paginate(
            {
                $or: [{ creator: userId }, { members: userId }],
            },
            {
                page: +page,
                limit: +perPage,
                sort: '-updatedAt',
                populate: [
                    { path: 'creator', select: 'first_name last_name email avatar_url online_status' },
                    { path: 'members', select: 'first_name last_name email avatar_url online_status' },
                ],
                select: "-createdAt -updatedAt -__v",
                lean: true
            }
        );


        // Nếu conversations < perPage, lấy danh sách friend để thêm vào conversations
        if (conversations.docs.length < +perPage) {


            let conversationMembers: any[] = []

            // lấy danh sách friend đã có conversation với user
            if (conversations.docs && conversations.docs.length > 0) {
                conversations.docs.forEach(conversation => {
                    if (!conversation.members || conversation.members.length <= 0) return
                    let filMem = conversation.members.filter(member => member._id.toString() !== userId).map(item => item._id)
                    conversationMembers = [...conversationMembers, ...filMem]

                })
            }

            // page = 1 => 1- 1 * 10 = 0 - (vd: total = 7) = -7
            // page = 2 => 1 * 10 = 10 - (vd: total = 7)  = 3
            // page = 3 => 2 * 10 = 20 - (vd: total = 7) = 13

            let skip = (+page - 1) * +perPage - conversations.totalDocs
            skip = skip <= 0 ? 0 : skip++

            // lấy danh sách friend chưa có conversation với user
            const friends = await Friend.find({ user: userId, friend: { $nin: conversationMembers } })
                .select('friend')
                .populate({ path: 'friend', select: 'first_name last_name email avatar_url online_status' })
                .limit((+perPage) - conversations.docs.length)
                .lean();


            if (!friends) {
                return res.status(200).json(createResponse("Get conversation successfully", true, conversations));

            }

            // Thêm danh sách friend vào conversations
            conversations.docs.push(...friends.map((f) => ({ ...f.friend, is_friend: true })));
        }

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

export {
    createConversation,
    updateMembers,
    delMember,
    getConversations
}