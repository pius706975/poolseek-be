import { NextFunction, Request, Response } from 'express';
import authService from './auth.service';

const authController = {
    signUp: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userData = req.body;
            const response = await authService.signUp(userData);

            res.status(201).json({
                message: 'Successfully signed up',
                data: response.user,
            });
        } catch (error) {
            next(error);
        }
    },

    signIn: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userData = req.body;
            const { device_id } = req.body;
            const deviceName = req.body.device_name || 'Unknown Device';
            const deviceModel = req.body.device_model || 'Unknown Model';
            const response = await authService.signIn(
                userData,
                device_id,
                deviceName,
                deviceModel,
            );

            res.status(200).json({
                message: 'Successfully signed in',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    },
};

export default authController;
