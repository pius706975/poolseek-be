import { NextFunction, Request, Response } from 'express';
import roleService from './role.service';

const roleController = {
    create: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const roleData = req.body;
            const response = await roleService.create(roleData);

            res.status(201).json({
                message: 'Successfully created role',
                data: response.role,
            });
        } catch (error) {
            next(error);
        }
    },

    delete: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;
            await roleService.delete(parseInt(id));

            res.status(200).json({
                message: 'Successfully deleted role',
            });
        } catch (error) {
            next(error);
        }
    },

    getRoles: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const response = await roleService.getRoles();

            res.status(200).json({
                message: 'Successfully fetched roles',
                data: response.roles,
            });
        } catch (error) {
            next(error);
        }
    },

    getRoleById: async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const response = await roleService.getRoleById(parseInt(id));

            res.status(200).json({
                message: 'Successfully fetched role',
                data: response.role,
            });
        } catch (error) {
            next(error);
        }
    },
};

export default roleController;
