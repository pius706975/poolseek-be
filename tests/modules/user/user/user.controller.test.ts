import { Request, Response, NextFunction } from 'express';
import userController from '../../../../src/modules/user/user/user.controller';
import userService from '../../../../src/modules/user/user/user.service';
import { CustomError } from '../../../../src/utils/custom-error';

jest.mock('../../../../src/modules/user/user/user.service', () => ({
    sendOTP: jest.fn(),
    verifyOTP: jest.fn(),
    getUserProfile: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks(); 
});

describe('sendOTPController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: {
                email: 'user@example.com',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();

        jest.clearAllMocks();
    });

    it('should send OTP successfully and return 200', async () => {
        (userService.sendOTP as jest.Mock).mockResolvedValue(undefined);

        await userController.sendOTP(req as Request, res as Response, next);

        expect(userService.sendOTP).toHaveBeenCalledWith(req.body.email);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'OTP sent successfully' });
    });

    it('should call next with error if sendOTPService throws an error', async () => {
        const error = new CustomError('Failed to send OTP', 500);
        (userService.sendOTP as jest.Mock).mockRejectedValue(error);

        await userController.sendOTP(req as Request, res as Response, next);

        expect(userService.sendOTP).toHaveBeenCalledWith(req.body.email);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

describe('verifyOTPController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: {
                email: 'user@example.com',
                otp: '123456',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();

        jest.clearAllMocks();
    });

    it('should verify OTP successfully and return 200', async () => {
        (userService.verifyOTP as jest.Mock).mockResolvedValue(undefined);

        await userController.verifyOTP(req as Request, res as Response, next);

        expect(userService.verifyOTP).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'OTP verified successfully' });
    });

    it('should call next with error if verifyOTPService throws an error', async () => {
        const error = new CustomError('Invalid OTP', 400);
        (userService.verifyOTP as jest.Mock).mockRejectedValue(error);

        await userController.verifyOTP(req as Request, res as Response, next);

        expect(userService.verifyOTP).toHaveBeenCalledWith(req.body);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

describe('getUserProfileController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            headers: {
                authorization: 'Bearer mockAccessToken',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();

        jest.clearAllMocks();
    });

    it('should return user profile when accessToken is valid', async () => {
        const mockUser = {
            id: 'user123',
            email: 'user@example.com',
            username: 'user',
        };
        (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);

        await userController.getUserProfile(req as Request, res as Response, next);

        expect(userService.getUserProfile).toHaveBeenCalledWith('mockAccessToken');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User data fetched',
            data: mockUser,
        });
    });

    it('should return 404 if authorization header is missing', async () => {
        req.headers!.authorization = undefined;

        await userController.getUserProfile(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        expect(userService.getUserProfile).not.toHaveBeenCalled();
    });

    it('should call next with error if getUserProfileService throws an error', async () => {
        const error = new CustomError('Invalid token', 401);
        (userService.getUserProfile as jest.Mock).mockRejectedValue(error);

        await userController.getUserProfile(req as Request, res as Response, next);

        expect(userService.getUserProfile).toHaveBeenCalledWith('mockAccessToken');
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
