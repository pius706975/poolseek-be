import { Request, Response, NextFunction } from 'express';
import authController from '../../../../src/modules/user/auth/auth.controller';
import authService from '../../../../src/modules/user/auth/auth.service';

jest.mock('../../../../src/modules/user/auth/auth.service', () => ({
    signUp: jest.fn(),
    signIn: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks(); 
});

describe('signUpController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { body: { email: 'new@example.com', password: 'password' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 201 and response data on successful sign-up', async () => {
        const mockUser = { id: 1, email: 'new@example.com', username: 'newuser' };
        (authService.signUp as jest.Mock).mockResolvedValue({ user: mockUser });

        await authController.signUp(req as Request, res as Response, next);

        expect(authService.signUp).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Successfully signed up',
            data: mockUser,
        });
    });

    it('should call next with error if service throws an error', async () => {
        const error = new Error('Service error');
        (authService.signUp as jest.Mock).mockRejectedValue(error);

        await authController.signUp(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('signInController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { body: { email: 'test@example.com', password: 'password' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 200 and response data on successful sign-in', async () => {
        const mockResponse = {
            user: { id: 1, email: 'test@example.com', username: 'testuser' },
            accessToken: 'mocked_access_token',
        };
        (authService.signIn as jest.Mock).mockResolvedValue(mockResponse);

        await authController.signIn(req as Request, res as Response, next);

        expect(authService.signIn).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Successfully signed in',
            data: mockResponse,
        });
    });

    it('should call next with error if service throws an error', async () => {
        const error = new Error('Invalid credentials');
        (authService.signIn as jest.Mock).mockRejectedValue(error);

        await authController.signIn(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});