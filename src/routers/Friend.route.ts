import { createRequestValidation, updateRequestValidation } from './../middlewares/paramsRules.middleware';
import { getRequestFriends, requestFriend, updateRequestStatus } from '@controllers/Friend.controller'
import express, { Router } from 'express'
import passport from 'passport';

const friendRouter: Router = express.Router()

friendRouter.post("/requests", createRequestValidation, passport.authenticate("jwt", { session: false }), requestFriend)

friendRouter.put("/requests/:id", updateRequestValidation, passport.authenticate("jwt", { session: false }), updateRequestStatus);


export default friendRouter