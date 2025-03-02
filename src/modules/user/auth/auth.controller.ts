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
            const response = await authService.signIn(userData);

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
