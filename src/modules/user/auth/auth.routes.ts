import express from 'express';
import authController from './auth.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const authRouter = express.Router();

authRouter.post('/signup', authController.signUp);
authRouter.post('/signin', authController.signIn);
authRouter.post('/signout', authMiddleware, authController.signOut);
authRouter.post('/refresh-token', authController.refreshToken);

export default authRouter;
