import express from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware';
import userController from './user.controller';

const userRouter = express.Router();

userRouter.put('/send-otp', userController.sendOTP);
userRouter.put('/verify-otp', userController.verifyOTP);
userRouter.put('/update-password', userController.updatePassword);
userRouter.get('/profile', authMiddleware, userController.getUserProfile);

export default userRouter;
