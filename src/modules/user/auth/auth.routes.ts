import express from 'express';
import authController from './auth.controller';

const authRouter = express.Router();

authRouter.post('/signup', authController.signUp);
authRouter.post('/signin', authController.signIn);
authRouter.post('/refresh-token', authController.refreshToken);

export default authRouter;
