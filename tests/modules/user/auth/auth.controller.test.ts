import { Request, Response, NextFunction } from 'express';
import authController from '../../../../src/modules/user/auth/auth.controller';
import authService from '../../../../src/modules/user/auth/auth.service';
import { sign } from 'crypto';

jest.mock('../../../../src/modules/user/auth/auth.service', () => ({
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    refreshToken: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks(); 
});

describe('signOutController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            headers: { authorization: 'Bearer test_access_token' },
            body: { device_id: 'test_device_id' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 200 and success message on successful sign-out', async () => {
        (authService.signOut as jest.Mock).mockResolvedValue(true);

        await authController.signOut(req as Request, res as Response, next);

        expect(authService.signOut).toHaveBeenCalledWith('test_access_token', 'test_device_id');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Successfully signed out' });
    });

    it('should return 404 if authorization header is missing', async () => {
        req.headers = {}; 

        await authController.signOut(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        expect(authService.signOut).not.toHaveBeenCalled();
    });

    it('should call next with error if service throws an error', async () => {
        const error = new Error('Service error');
        (authService.signOut as jest.Mock).mockRejectedValue(error);

        await authController.signOut(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
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
    
        expect(authService.signIn).toHaveBeenCalledWith(
            req.body,
            req.body.device_id,
            req.body.device_name || 'Unknown Device',
            req.body.device_model || 'Unknown Model'
        );
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


describe('refreshTokenController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: {
                user_id: 'user123',
                device_id: 'device456',
                refresh_token: 'valid_refresh_token',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 200 and new access token on successful refresh', async () => {
        const mockResponse = { access_token: 'new_access_token' };
        (authService.refreshToken as jest.Mock).mockResolvedValue(mockResponse);

        await authController.refreshToken(req as Request, res as Response, next);

        expect(authService.refreshToken).toHaveBeenCalledWith(
            req.body.user_id,
            req.body.device_id,
            req.body.refresh_token,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Successfully refreshed token',
            data: mockResponse,
        });
    });

    it('should call next with error if service throws an error', async () => {
        const error = new Error('Invalid refresh token');
        (authService.refreshToken as jest.Mock).mockRejectedValue(error);

        await authController.refreshToken(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
