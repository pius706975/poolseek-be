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

    signOut: async (
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
            const { device_id } = req.body;

            await authService.signOut(accessToken, device_id);

            res.status(200).json({
                message: 'Successfully signed out',
            });
        } catch (error) {
            next(error);
        }
    },

    resetPassword: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { email, password } = req.body;

            await authService.resetPassword({ email, password });

            res.status(200).json({
                message: 'Password reset successfully',
            });
        } catch (error) {
            next(error);
        }
    },

    refreshToken: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { user_id, device_id, refresh_token } = req.body;
            const response = await authService.refreshToken(
                user_id,
                device_id,
                refresh_token,
            );

            res.status(200).json({
                message: 'Successfully refreshed token',
                data: response,
            });
        } catch (error) {
            next(error);
        }
    },
};

export default authController;
