import createResponse from '@helpers/createResponse';
import createHttpError from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import RequestFriend from '@models/RequestFriend';
import User from '@models/User';
import { notificationsQueue } from '@queues/queue';


/**
 * Create request friend
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const requestFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { recipientId } = req.body;

        if (!req.user) return next(createHttpError(401, "Unauthorized"));
        const requester = req.user.id;

        // Kiểm tra xem đã gửi lời mời kết bạn chưa
        const existingRequest = await RequestFriend.findOne({ requester, recipient: recipientId });
        if (existingRequest) {
            return res.status(400).json({ success: false, message: "Bạn đã gửi lời mời kết bạn đến người này rồi" });
        }

        // Tạo request friend mới
        const newRequest = new RequestFriend({ requester, recipient: recipientId });
        await newRequest.save();

        // Tạo notification
        const sender = await User.findById(requester);
        const message = `${sender?.first_name} ${sender?.last_name} đã gửi cho bạn một lời mời kết bạn`;

        notificationsQueue.add({
            sender: requester,
            recipient: recipientId,
            message
        })

        // Trả về kết quả
        return res.json(createResponse("Friend request sent successfully.", true));
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, "Internal server error..."))
    }
}

/**
 * get requestFriends
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const getRequestFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return next(createHttpError(401, "Unauthorized"));
        // lấy thông tin người dùng hiện tại từ token
        const currentUser = req.user;

        const requests = await RequestFriend.find({ recipient: currentUser.id })
            .populate('requester', 'first_name last_name avatar_url')
            .select('_id requester createdAt status')
            .exec();
        return res.status(200).json(createResponse("Get requests success!", true, requests));
    } catch (err: any) {
        return next(createHttpError(500, "Internal server error..."))
    }
}

/**
 * update request status
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const updateRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // Find the friend request by ID
        const request = await RequestFriend.findById(req.params.id);

        // If request doesn't exist, return an error response
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (!req.user) return next(createHttpError(401, "Unauthorized"));

        // If recipient isn't the current user, return an error response
        if (request.recipient.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }

        // If request has already been accepted or rejected, return an error response
        if (request.status !== "pending") {
            return res.status(400).json({ success: false, message: "Request has already been responded" });
        }

        // Update the status of the friend request
        request.status = req.body.status;
        await request.save();

        const requester = await User.findById(request.requester);
        const recipient = await User.findById(request.recipient);
        // If the request was accepted, create a new friend record for both users
        if (request.status === "accepted") {
            // add friend to user
            requester?.friends.push(recipient)
            recipient?.friends.push(requester)

            // save to database
            await Promise.all([requester?.save(), recipient?.save()])

            //create message of notification 
            let notifyMessage = `${recipient!.first_name} ${recipient!.last_name} accepted your friend request`

            // send notification
            notificationsQueue.add({
                sender: request.recipient,
                recipient: request.requester,
                message: notifyMessage
            })


        }

        // Return a success response
        return res.json(createResponse("Request updated successfully", true));


    } catch (error: any) {
        console.error(error.message);
        return res.json(createHttpError(500, "Server error...!"));
    }
}

export {
    requestFriend,
    getRequestFriends,
    updateRequestStatus
}