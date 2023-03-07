import { createRequestValidation, updateRequestValidation } from './../middlewares/paramsRules.middleware';
import { getRequestFriends, requestFriend, updateRequestStatus } from '@controllers/Friend.controller'
import authenticate from '@middlewares/auth.middleware'
import express, { Router } from 'express'
import passport from 'passport';

const friendRouter: Router = express.Router()

friendRouter.post("/requests", createRequestValidation, authenticate(), requestFriend)

friendRouter.get('/requests', passport.authenticate("jwt", { session: false }), getRequestFriends)

// Route to update friend request status
friendRouter.put("/requests/:id", updateRequestValidation, authenticate(), updateRequestStatus);


export default friendRouter