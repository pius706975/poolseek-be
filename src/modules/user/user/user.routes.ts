import express from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware';
import userController from './user.controller';

const userRouter = express.Router();

userRouter.get('/profile', authMiddleware, userController.getUserProfile);

export default userRouter;
