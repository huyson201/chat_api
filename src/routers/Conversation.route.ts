import express, { Router } from 'express'
import { createConversation, delMember, updateMembers } from '@controllers/Conversation.controller';
import { getMessageList } from '@controllers/Message.controller';
import authenticate from '@middlewares/auth.middleware';
import {
    getConversationMessagesValidator,
    leaveConversationValidator,
    conversationValidation,
    updateMembersValidation
} from './../middlewares/paramsRules.middleware';
import passport from 'passport';
import Conversation from '@models/Conversation';

const conversationRouter: Router = express.Router()


// Define createConversation API endpoint
conversationRouter.post('/', conversationValidation, createConversation);
conversationRouter.get("/:userId", async (req: any, res: any, next: any) => {
    let conversations = await Conversation.paginate({
        $or: [{ creator: req.params.userId }, { members: req.params.userId }],
    }, {
        page: 1,
        limit: 10,
        sort: '-updatedAt',
        populate: [
            { path: 'creator', select: 'first_name last_name email avatar_url online_status' },
            { path: 'members', select: 'first_name last_name email avatar_url online_status' },
            { path: "lastMessage", select: "sender content" }
        ],
        select: "-createdAt -updatedAt -__v",
        lean: true
    })

    return res.json(conversations)
})

conversationRouter.put('/:id/members', updateMembersValidation, updateMembers);

// get list message of conversation
conversationRouter.get('/:conversationId/messages', getConversationMessagesValidator, passport.authenticate("jwt", { session: false }), getMessageList);

conversationRouter.delete('/:conversationId/leave', leaveConversationValidator, authenticate(), delMember);

export default conversationRouter
