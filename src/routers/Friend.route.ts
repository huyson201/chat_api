
import { getRequestFriends, requestFriend, updateRequestStatus } from '@controllers/Friend.controller'
import authenticate from '@middlewares/auth.middleware'
import express, { Router, Request, Response } from 'express'

const friendRouter: Router = express.Router()

friendRouter.post("/requests", authenticate(), requestFriend)

friendRouter.get('/requests', authenticate(), getRequestFriends)

// const { RequestFriend, User, Friend } = require("../models");

// Route to update friend request status
friendRouter.put("/requests/:id", authenticate(), updateRequestStatus);


export default friendRouter