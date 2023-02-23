import { createMessageValidation } from './../middlewares/paramsRules.middleware';
import { createMessage } from '@controllers/Message.controller';
import authenticate from '@middlewares/auth.middleware';
import express, { Router, Request, Response } from 'express'

const messageRouter: Router = express.Router()

// Create new message
messageRouter.post('/', createMessageValidation, authenticate(), createMessage);

export default messageRouter