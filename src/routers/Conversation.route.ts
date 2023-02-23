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

const conversationRouter: Router = express.Router()


// Define createConversation API endpoint
conversationRouter.post('/', conversationValidation, createConversation);

conversationRouter.put('/:id/members', updateMembersValidation, updateMembers);

// get list message of conversation
conversationRouter.get('/:conversationId/messages', getConversationMessagesValidator, getMessageList);

conversationRouter.delete('/:conversationId/leave', leaveConversationValidator, authenticate(), delMember);

export default conversationRouter
