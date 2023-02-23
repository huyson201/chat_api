import { body, check, param, query } from 'express-validator'
import mongoose from 'mongoose';

// define validator rules
export const registerValidation = [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password should be at least 6 characters long'),
    body('confirmPassword').notEmpty().withMessage('Confirm password is required')
        .custom((value: string, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
]



export const loginValidation = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email is not valid'),
    body('password')
        .notEmpty().withMessage('Password is required')
]



export const refreshTokenValidation = [
    body('refresh_token').notEmpty().withMessage('Refresh token is required.'),
]


export const conversationValidation = [
    // check creator_id field
    body('creator_id')
        .exists({ checkFalsy: true }).withMessage('Creator ID is required')
        .isMongoId().withMessage('Creator ID must be a valid ObjectId'),
    // check members field
    body('members')
        .exists({ checkFalsy: true }).withMessage('Members are required')
        .isArray({ min: 1 }).withMessage('Members must be an array'),
    body('members.*')
        .isMongoId().withMessage('members must be valid ObjectId')
]

export const updateMembersValidation = [
    param('id')
        .exists({ checkFalsy: true }).withMessage('conversation ID is required')
        .isMongoId().withMessage('conversation id must be a valid ObjectId'),
    body('members')
        .exists({ checkFalsy: true }).withMessage('Members are required')
        .isArray({ min: 1 }).withMessage('members array must have at least 2 elements'),
    body('members.*')
        .isMongoId().withMessage('members must be valid ObjectId')
]

export const getConversationMessagesValidator = [
    // Kiểm tra conversationId
    param('conversationId')
        .exists({ checkFalsy: true }).withMessage('conversation ID is required')
        .isMongoId().withMessage('conversationId must be a valid ObjectId'),

    // Kiểm tra trường 'page' trong query string
    query('page')
        .if(query('page').exists())
        .isInt({ min: 1 }).withMessage('page must be an integer greater than or equal to 1'),

    // Kiểm tra trường 'limit' trong query string
    query('limit')
        .if(query('limit').exists())
        .isInt({ min: 1 }).withMessage('limit must be an integer greater than or equal to 1')
];

export const leaveConversationValidator = [
    param('conversationId')
        .exists({ checkFalsy: true }).withMessage('conversation ID is required')
        .isMongoId().withMessage('conversationId is invalid')
]


export const createRequestValidation = [
    body('recipientId')
        .notEmpty()
        .withMessage('Recipient ID is required')
        .isMongoId()
        .withMessage('Recipient ID is invalid')
]

export const updateRequestValidation = [
    param('id')
        .notEmpty().withMessage('Id cannot be empty')
        .isMongoId().withMessage('Id is invalid'),

    check('status')
        .isIn(['accepted', 'rejected']).withMessage('Status must be either "accepted" or "rejected"'),
];

export const createMessageValidation = [
    body('conversationId')
        .notEmpty().withMessage('Conversation ID is required')
        .isMongoId().withMessage('conversation id must be a valid ObjectId'),
    body('content').notEmpty().withMessage('Content is required'),
];