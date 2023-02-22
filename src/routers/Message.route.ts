import { createMessage } from '@controllers/Message.controller';
import authenticate from '@middlewares/auth.middleware';
import express, { Router, Request, Response } from 'express'

const messageRouter: Router = express.Router()

// Create new message
messageRouter.post('/', authenticate(), createMessage);

export default messageRouter