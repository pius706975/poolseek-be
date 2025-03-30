import { NextFunction, Request, Response } from 'express';
import userService from './user.service';

const userController = {
    sendOTP: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            await userService.sendOTP(email);

            res.status(200).json({
                message: 'OTP sent successfully',
            });
        } catch (error) {
            next(error);
        }
    },

    verifyOTP: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = req.body;
            await userService.verifyOTP(userData);

            res.status(200).json({
                message: 'OTP verified successfully',
            });
        } catch (error) {
            next(error);
        }
    },

    updatePassword: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const authorization = req.headers.authorization;
            if (!authorization) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const accessToken = authorization.split(' ')[1];

            const userData = req.body;

            await userService.updatePassword(accessToken, userData);

            res.status(200).json({
                message: 'Password updated successfully',
            });
        } catch (error) {
            next(error);
        }
    },

    getUserProfile: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const authorization = req.headers.authorization;
            if (!authorization) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const accessToken = authorization.split(' ')[1];
            const response = await userService.getUserProfile(accessToken);

            res.status(200).json({
                message: 'User data fetched',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    },
};

export default userController;
