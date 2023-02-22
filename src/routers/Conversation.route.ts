
import express, { Router } from 'express'
import { createConversation, delMember, updateMembers } from '@controllers/Conversation.controller';
import { getMessageList } from '@controllers/Message.controller';
import authenticate from '@middlewares/auth.middleware';

const conversationRouter: Router = express.Router()


// Define createConversation API endpoint
conversationRouter.post('/', createConversation);

conversationRouter.put('/:id/members', updateMembers);

// get list message of conversation
conversationRouter.get('/:conversationId/messages', getMessageList);

conversationRouter.delete('/:conversationId/leave', authenticate(), delMember);

export default conversationRouter
