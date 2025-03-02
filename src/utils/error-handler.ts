import { Request, Response, NextFunction } from 'express';
import { CustomError } from './custom-error';

export const errorHandler = (
    err: Error | CustomError,
    // eslint-disable-next-line
    req: Request,
    res: Response,
    // eslint-disable-next-line
    next: NextFunction,
) => {
    const statusCode = err instanceof CustomError ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({ error: message });
};
