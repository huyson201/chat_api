import createHttpError from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import RequestFriend from '@models/RequestFriend';
import User from '@models/User';
import NotificationModel from '@models/Notifications';
import { FriendModel } from '@models/Friend';

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
        const recipient = await User.findById(recipientId);

        const message = `${sender?.first_name} ${sender?.last_name} đã gửi cho bạn một lời mời kết bạn`;
        const newNotification = new NotificationModel({ sender: requester, recipient: recipientId, message, type: "friend_request" });
        await newNotification.save();

        // Trả về kết quả
        return res.json({ success: true, message: "Gửi lời mời kết bạn thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Đã có lỗi xảy ra" });
    }
}


const getRequestFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return next(createHttpError(401, "Unauthorized"));
        const currentUser = req.user; // lấy thông tin người dùng hiện tại từ token

        const requests = await RequestFriend.find({ recipient: currentUser.id })
            .populate('requester', 'first_name last_name avatar_url')
            .select('_id requester createdAt status')
            .exec();

        res.status(200).json({ success: true, requests: requests });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const updateRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // define message of notification
        let notifyMessage = ''

        // Find the friend request by ID
        const request = await RequestFriend.findById(req.params.id);

        // If request doesn't exist, return an error response
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (!req.user) return next(createHttpError(401, "Unauthorized"));

        // If requester isn't the current user, return an error response
        if (request.requester.toString() !== req.user.id) {
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

            const requesterFriend = new FriendModel({
                user: requester!._id,
                friend: recipient!._id,
            });
            await requesterFriend.save();

            const recipientFriend = new FriendModel({
                user: recipient!._id,
                friend: requester!._id,
            });

            await recipientFriend.save();
            notifyMessage = `${recipient!.first_name} ${recipient!.last_name} accepted your friend request`
        }


        if (request.status === "rejected") {
            notifyMessage = `${recipient!.first_name} ${recipient!.last_name} rejected your friend request`

        }

        // create notification
        const notification = await NotificationModel.create({
            recipient: requester!._id,
            senderId: req.user.id,
            message: notifyMessage,
        });

        // Return a success response
        return res.status(200).json({ success: true, message: "Request updated successfully" });
    } catch (error: any) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export {
    requestFriend,
    getRequestFriends,
    updateRequestStatus
}