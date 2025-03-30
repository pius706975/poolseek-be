import userService from '../../../../src/modules/user/user/user.service';
import { verifyJWT } from '../../../../src/middlewares/jwt.service';
import authRepo from '../../../../src/modules/user/user/user.repo';
import { CustomError } from '../../../../src/utils/custom-error';
import { JWT_ACCESS_TOKEN_SECRET } from '../../../../src/config/index';
import {
    validateSendOTP,
    validateUpdatePassword,
    validateVerifyOTP,
} from '../../../../src/modules/user/user/user.validator';
import generateOTP from '../../../../src/utils/generate-otp';
import sendEmail from '../../../../src/utils/nodemailer';
import userRepo from '../../../../src/modules/user/user/user.repo';
import { hash } from 'bcrypt';
import { User } from '../../../../src/interfaces/user.interface';

jest.mock('../../../../src/utils/generate-otp');
jest.mock('../../../../src/middlewares/jwt.service');
jest.mock('../../../../src/modules/user/user/user.repo');

jest.mock('../../../../src/database', () => ({
    DB: {
        sequelize: {
            close: jest.fn(),
            authenticate: jest.fn(),
        },
    },
}));

jest.mock('../../../../src/modules/user/user/user.validator', () => ({
    validateSendOTP: jest.fn(),
    validateVerifyOTP: jest.fn(),
    validateUpdatePassword: jest.fn().mockReturnValue({ error: null }),
}));

jest.mock('../../../../src/utils/nodemailer', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../../src/config/index', () => ({
    JWT_ACCESS_TOKEN_SECRET: 'mock_secret_key',
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('sendOTPService', () => {
    const mockEmail = 'user@example.com';
    const mockUser = {
        id: 'user123',
        email: 'user@example.com',
        first_name: 'First Name',
        otp_code: '',
        otp_expiration: null,
    };
    const mockOTP = '123456';

    it('should return updated user with OTP if email is valid', async () => {
        (validateSendOTP as jest.Mock).mockReturnValue({ error: null });
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        (generateOTP as jest.Mock).mockReturnValue(mockOTP);
        (userRepo.update as jest.Mock).mockResolvedValue({
            ...mockUser,
            otp_code: mockOTP,
            otp_expiration: new Date(Date.now() + 10 * 60 * 1000),
        });

        (sendEmail as jest.Mock).mockResolvedValue(undefined);

        const result = await userService.sendOTP(mockEmail);

        expect(validateSendOTP).toHaveBeenCalledWith(mockEmail);
        expect(userRepo.getUserByEmail).toHaveBeenCalledWith(mockEmail);
        expect(generateOTP).toHaveBeenCalledWith(6);
        expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, {
            ...mockUser,
            otp_code: mockOTP,
            otp_expiration: expect.any(Date),
        });
        expect(sendEmail).toHaveBeenCalledWith(
            mockEmail,
            'One Time Password',
            'Your OTP code.',
            expect.stringContaining(`Hi, ${mockUser.first_name}!`),
            expect.stringContaining('<h2>123456</h2>'),
            expect.stringContaining('This code is valid for 10 minutes.'),
            expect.stringContaining(
                "If you didn't request this code, please ignore this email.",
            ),
            expect.any(String),
        );
        expect(result).toEqual({
            ...mockUser,
            otp_code: mockOTP,
            otp_expiration: expect.any(Date),
        });
    });

    it('should throw 400 error if email validation fails', async () => {
        (validateSendOTP as jest.Mock).mockReturnValue({
            error: { details: [{ message: 'Email is required' }] },
        });

        await expect(userService.sendOTP(mockEmail)).rejects.toThrow(
            'Email is required',
        );
        expect(validateSendOTP).toHaveBeenCalledWith(mockEmail);
    });

    it('should throw 404 error if user not found', async () => {
        (validateSendOTP as jest.Mock).mockReturnValue({ error: null });
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(null);

        await expect(userService.sendOTP(mockEmail)).rejects.toThrow(
            'User not found',
        );
        expect(userRepo.getUserByEmail).toHaveBeenCalledWith(mockEmail);
    });
});

describe('verifyOTPService', () => {
    const mockUser = {
        id: 'user123',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        image: '',
        role_id: 1,
        phone_number: '1234567890',
        password: 'hashedpassword',
        otp_code: '123456',
        otp_expiration: new Date(Date.now() + 5 * 60 * 1000),
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const mockRequestData = {
        email: 'user@example.com',
        otp_code: '123456',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should verify the user successfully if OTP is correct', async () => {
        (validateVerifyOTP as jest.Mock).mockReturnValue({ error: null });
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        (userRepo.update as jest.Mock).mockResolvedValue({
            ...mockUser,
            is_verified: true,
            otp_code: '',
        });

        const result = await userService.verifyOTP({
            ...mockUser,
            otp_code: '123456',
        });

        expect(validateVerifyOTP).toHaveBeenCalledWith(
            expect.objectContaining(mockRequestData),
        );
        expect(userRepo.getUserByEmail).toHaveBeenCalledWith(
            mockRequestData.email,
        );
        expect(userRepo.update).toHaveBeenCalledWith(mockUser.id, {
            ...mockUser,
            is_verified: true,
            otp_code: '',
        });
        expect(result).toEqual({
            ...mockUser,
            is_verified: true,
            otp_code: '',
        });
    });

    it('should throw 400 error if OTP validation fails', async () => {
        (validateVerifyOTP as jest.Mock).mockReturnValue({
            error: { details: [{ message: 'OTP code is required' }] },
        });

        await expect(
            userService.verifyOTP({
                ...mockUser,
                otp_code: mockRequestData.otp_code,
            }),
        ).rejects.toThrow('OTP code is required');

        expect(validateVerifyOTP).toHaveBeenCalledWith(
            expect.objectContaining(mockRequestData),
        );
    });

    it('should throw 404 error if user is not found', async () => {
        (validateVerifyOTP as jest.Mock).mockReturnValue({ error: null });
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(null);

        await expect(
            userService.verifyOTP({ ...mockUser, otp_code: '123456' }),
        ).rejects.toThrow('User not found');
        expect(userRepo.getUserByEmail).toHaveBeenCalledWith(
            mockRequestData.email,
        );
    });

    it('should throw 400 error if OTP code is incorrect', async () => {
        (validateVerifyOTP as jest.Mock).mockReturnValue({ error: null });
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue({
            ...mockUser,
            otp_code: '654321',
        });

        await expect(
            userService.verifyOTP({ ...mockUser, otp_code: '123456' }),
        ).rejects.toThrow('Invalid OTP code');
        expect(userRepo.getUserByEmail).toHaveBeenCalledWith(
            mockRequestData.email,
        );
    });

    it('should throw 400 error if OTP code has expired', async () => {
        (validateVerifyOTP as jest.Mock).mockReturnValue({ error: null });
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue({
            ...mockUser,
            otp_expiration: new Date(Date.now() - 1 * 60 * 1000),
        });

        await expect(
            userService.verifyOTP({ ...mockUser, otp_code: '123456' }),
        ).rejects.toThrow('OTP code has expired');
        expect(userRepo.getUserByEmail).toHaveBeenCalledWith(
            mockRequestData.email,
        );
    });
});

describe('updatePasswordService', () => {
    const mockAccessToken = 'mockAccessToken';
    const mockUserId = 'user123';
    const mockUser = {
        id: mockUserId,
        email: 'user@example.com',
        password: 'oldHashedPassword',
    };
    const mockUserData: User = {
        id: mockUserId,
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        image: '',
        role_id: 1,
        phone_number: '1234567890',
        password: 'newPassword123',
        otp_code: '',
        otp_expiration: new Date(),
        is_verified: false,
        created_at: undefined,
        updated_at: undefined,
    };

    const mockHashedPassword = 'newHashedPassword';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update the user password successfully', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUserId });
        (userRepo.getUserById as jest.Mock).mockResolvedValue(mockUser);
        (hash as jest.Mock).mockResolvedValue(mockHashedPassword);
        (userRepo.update as jest.Mock).mockResolvedValue({
            ...mockUser,
            password: mockHashedPassword,
        });

        const result = await userService.updatePassword(
            mockAccessToken,
            mockUserData,
        );

        expect(verifyJWT).toHaveBeenCalledWith(
            mockAccessToken,
            JWT_ACCESS_TOKEN_SECRET,
        );
        expect(userRepo.getUserById).toHaveBeenCalledWith(mockUserId);
        expect(hash).toHaveBeenCalledWith(mockUserData.password, 10);
        expect(userRepo.update).toHaveBeenCalledWith(mockUserId, {
            ...mockUser,
            password: mockHashedPassword,
        });
        expect(result).toEqual({
            ...mockUser,
            password: mockHashedPassword,
        });
    });

    it('should throw an error if token is invalid', async () => {
        (verifyJWT as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        await expect(
            userService.updatePassword(mockAccessToken, mockUserData),
        ).rejects.toThrow('Invalid token');

        expect(verifyJWT).toHaveBeenCalledWith(
            mockAccessToken,
            JWT_ACCESS_TOKEN_SECRET,
        );
        expect(userRepo.getUserById).not.toHaveBeenCalled();
        expect(hash).not.toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUserId });
        (userRepo.getUserById as jest.Mock).mockResolvedValue(null);

        await expect(
            userService.updatePassword(mockAccessToken, mockUserData),
        ).rejects.toThrow('User not found');

        expect(userRepo.getUserById).toHaveBeenCalledWith(mockUserId);
        expect(hash).not.toHaveBeenCalled();
    });

    it('should throw a validation error if password is invalid', async () => {
        (validateUpdatePassword as jest.Mock).mockReturnValue({
            error: { details: [{ message: 'Password is required' }] },
        });

        await expect(
            userService.updatePassword(mockAccessToken, {} as any),
        ).rejects.toThrow('Password is required');

        expect(validateUpdatePassword).toHaveBeenCalledWith({});
        expect(verifyJWT).not.toHaveBeenCalled();
        expect(userRepo.getUserById).not.toHaveBeenCalled();
        expect(hash).not.toHaveBeenCalled();
    });
});

describe('getUserProfileService', () => {
    const mockAccessToken = 'mockAccessToken';
    const mockUserId = 'user123';
    const mockUser = {
        id: mockUserId,
        email: 'user@example.com',
        username: 'user',
    };

    it('should return user profile when accessToken is valid', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUserId });
        (authRepo.getUserById as jest.Mock).mockResolvedValue(mockUser);

        const result = await userService.getUserProfile(mockAccessToken);

        expect(verifyJWT).toHaveBeenCalledWith(
            mockAccessToken,
            JWT_ACCESS_TOKEN_SECRET,
        );
        expect(authRepo.getUserById).toHaveBeenCalledWith(mockUserId);
        expect(result).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUserId });
        (authRepo.getUserById as jest.Mock).mockResolvedValue(null);

        await expect(
            userService.getUserProfile(mockAccessToken),
        ).rejects.toThrow(new CustomError('User not found', 404));

        expect(verifyJWT).toHaveBeenCalledWith(
            mockAccessToken,
            expect.any(String),
        );
        expect(authRepo.getUserById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw an error if token verification fails', async () => {
        (verifyJWT as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        await expect(
            userService.getUserProfile(mockAccessToken),
        ).rejects.toThrow('Invalid token');

        expect(verifyJWT).toHaveBeenCalledWith(
            mockAccessToken,
            expect.any(String),
        );
        expect(authRepo.getUserById).not.toHaveBeenCalled();
    });
});
