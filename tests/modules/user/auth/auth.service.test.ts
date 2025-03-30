import authService from '../../../../src/modules/user/auth/auth.service';
import { CustomError } from '../../../../src/utils/custom-error';
import { User } from '../../../../src/interfaces/user.interface';
import authRepo from '../../../../src/modules/user/auth/auth.repo';
import { DB } from '../../../../src/database';
import { hash, compareSync } from 'bcrypt';
import {
    validateSignUp,
    validateSignIn,
    validateResetPassword,
} from '../../../../src/modules/user/auth/auth.validator';
import {
    generateJWT,
    verifyJWT,
} from '../../../../src/middlewares/jwt.service';
import userRepo from '../../../../src/modules/user/user/user.repo';
import sendEmail from '../../../../src/utils/nodemailer';
import generateOTP from '../../../../src/utils/generate-otp';
import {
    JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_SECRET,
} from '../../../../src/config/index';

jest.mock('../../../../src/modules/user/auth/auth.repo');
jest.mock('../../../../src/modules/user/user/user.repo');
jest.mock('../../../../src/database', () => ({
    DB: {
        sequelize: {
            close: jest.fn(),
            authenticate: jest.fn(),
        },
    },
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(() => Promise.resolve('hashedPassword')),
    compareSync: jest.fn(() => true),
}));

jest.mock('../../../../src/modules/user/auth/auth.validator', () => ({
    validateSignUp: jest.fn(),
    validateSignIn: jest.fn(() => ({ error: null })),
    validateResetPassword: jest.fn(),
}));

jest.mock('../../../../src/middlewares/jwt.service');

jest.mock('../../../../src/utils/nodemailer', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../../src/utils/generate-otp', () => ({
    __esModule: true,
    default: jest.fn(() => '123456'),
}));

jest.mock('../../../../src/config/index', () => ({
    JWT_ACCESS_TOKEN_SECRET: 'test_secret',
    JWT_REFRESH_TOKEN_SECRET: 'test_refresh_secret',
}));

afterAll(async () => {
    await DB.sequelize.close();
});

describe('signUpService', () => {
    it('should throw error if email already exists', async () => {
        const userData: User = {
            email: 'existing@example.com',
            first_name: 'First Name',
            last_name: 'Last Name',
            password: 'Password123!',
            image: 'www.img.com',
            role_id: 0,
            phone_number: '0857',
            otp_code: '123456',
            otp_expiration: new Date(),
            is_verified: false,
            created_at: undefined,
            updated_at: undefined,
        };

        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'existing@example.com',
        });

        (validateSignUp as jest.Mock).mockReturnValue({ error: null });

        await expect(authService.signUp(userData)).rejects.toThrow(
            new CustomError(`Email ${userData.email} already exists`, 409),
        );
    });

    it('should throw error if validation fails', async () => {
        const userData: User = {
            email: 'existing@example.com',
            first_name: 'First Name',
            last_name: 'Last Name',
            password: 'Password123!',
            image: 'www.img.com',
            role_id: 0,
            phone_number: '0857',
            otp_code: '123456',
            otp_expiration: new Date(),
            is_verified: false,
            created_at: undefined,
            updated_at: undefined,
        };

        const validationError = {
            details: [{ message: 'Email format is invalid' }],
        };
        (validateSignUp as jest.Mock).mockReturnValue({
            error: validationError,
        });

        await expect(authService.signUp(userData)).rejects.toThrow(
            new CustomError('Email format is invalid', 400),
        );
    });

    it('should create new user if email is available', async () => {
        const userData: User = {
            email: 'new@example.com',
            first_name: 'First Name',
            last_name: 'Last Name',
            password: 'Password123!',
            image: 'www.img.com',
            role_id: 0,
            phone_number: '0857',
            otp_code: '123456',
            otp_expiration: new Date(),
            is_verified: false,
            created_at: undefined,
            updated_at: undefined,
        };

        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(null);
        (validateSignUp as jest.Mock).mockReturnValue({ error: null });

        const newUser = {
            id: 1,
            email: 'new@example.com',
            username: 'new-username',
            password: 'hashedPassword',
            otp_code: '123456',
            otp_expiration: new Date(),
        };

        (authRepo.createUser as jest.Mock).mockResolvedValue(newUser);

        const result = await authService.signUp(userData);

        expect(result).toEqual({ user: newUser });

        expect(authRepo.createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                otp_code: '123456',
                otp_expiration: expect.any(Date),
            }),
        );

        expect(hash).toHaveBeenCalledWith(userData.password, 10);

        expect(generateOTP).toHaveBeenCalledWith(6);

        expect(sendEmail).toHaveBeenCalledWith(
            userData.email,
            'One Time Password',
            'Your OTP code.',
            expect.stringContaining(`Hi, ${userData.first_name}!`),
            expect.stringContaining('<h2>123456</h2>'),
            expect.stringContaining('This code is valid for 10 minutes.'),
            expect.stringContaining(
                "If you didn't request this code, please ignore this email.",
            ),
            expect.any(String),
        );
    });
});

describe('signInService', () => {
    const mockUser: User = {
        email: 'existing@example.com',
        first_name: 'First Name',
        last_name: 'Last Name',
        password: 'Password123!',
        image: 'www.img.com',
        role_id: 1,
        phone_number: '0857',
        otp_code: '123456',
        otp_expiration: new Date(),
        is_verified: false,
        created_at: undefined,
        updated_at: undefined,
    };

    const mockDevice = {
        device_id: 'abc123',
        device_name: 'Samsung Galaxy S21',
        device_model: 'SM-G991B',
    };

    it('should return user and accessToken if credentials are correct', async () => {
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        (generateJWT as jest.Mock).mockResolvedValue('mocked_access_token');
        jest.spyOn(require('bcrypt'), 'compareSync').mockReturnValue(true);

        const result = await authService.signIn(
            {
                email: 'test@example.com',
                password: 'correct_password',
                first_name: 'First Name',
                last_name: 'Last Name',
                image: 'www.img.com',
                role_id: 1,
                phone_number: '0857',
                otp_code: '123456',
                otp_expiration: new Date(),
                is_verified: false,
                created_at: undefined,
                updated_at: undefined,
            },
            mockDevice.device_id,
            mockDevice.device_name,
            mockDevice.device_model,
        );

        expect(userRepo.getUserByEmail).toHaveBeenCalledWith(
            'test@example.com',
        );
        expect(generateJWT).toHaveBeenCalled();
        expect(result).toEqual({
            user: mockUser,
            access_token: 'mocked_access_token',
            refresh_token: 'mocked_access_token',
        });
    });

    it('should throw 401 error if user is not found', async () => {
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(null);

        await expect(
            authService.signIn(
                {
                    email: 'test@example.com',
                    password: 'wrong_password',
                    first_name: 'First Name',
                    last_name: 'Last Name',
                    image: 'www.img.com',
                    role_id: 1,
                    phone_number: '0857',
                    otp_code: '123456',
                    otp_expiration: new Date(),
                    is_verified: false,
                    created_at: undefined,
                    updated_at: undefined,
                },
                mockDevice.device_id,
                mockDevice.device_name,
                mockDevice.device_model,
            ),
        ).rejects.toThrow('Email or password is invalid');
    });

    it('should throw 401 error if password is incorrect', async () => {
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        jest.spyOn(require('bcrypt'), 'compareSync').mockReturnValue(false);

        await expect(
            authService.signIn(
                {
                    email: 'test@example.com',
                    password: 'wrong_password',
                    first_name: 'First Name',
                    last_name: 'Last Name',
                    image: 'www.img.com',
                    role_id: 1,
                    phone_number: '0857',
                    otp_code: '123456',
                    otp_expiration: new Date(),
                    is_verified: false,
                    created_at: undefined,
                    updated_at: undefined,
                },
                mockDevice.device_id,
                mockDevice.device_name,
                mockDevice.device_model,
            ),
        ).rejects.toThrow('Email or password is invalid');
    });

    it('should throw 400 error if validation fails', async () => {
        (validateSignIn as jest.Mock).mockReturnValue({
            error: {
                details: [{ message: 'Email and password are required' }],
            },
        });

        await expect(
            authService.signIn(
                {
                    email: '',
                    password: '',
                    first_name: '',
                    last_name: '',
                    image: '',
                    role_id: 0,
                    phone_number: '',
                    otp_code: '',
                    otp_expiration: new Date(),
                    is_verified: false,
                    created_at: undefined,
                    updated_at: undefined,
                },
                mockDevice.device_id,
                mockDevice.device_name,
                mockDevice.device_model,
            ),
        ).rejects.toThrow('Email and password are required');
    });
});

describe('signOutService', () => {
    const mockAccessToken = 'valid_access_token';
    const mockDeviceId = 'device123';
    const mockUserId = 'user123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully sign out and delete the refresh token', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUserId });
        (userRepo.getUserById as jest.Mock).mockResolvedValue({
            id: mockUserId,
        });
        (authRepo.deleteRefreshTokenByDevice as jest.Mock).mockResolvedValue(
            true,
        );

        const result = await authService.signOut(mockAccessToken, mockDeviceId);

        expect(verifyJWT).toHaveBeenCalledWith(mockAccessToken, 'test_secret');
        expect(userRepo.getUserById).toHaveBeenCalledWith(mockUserId);
        expect(authRepo.deleteRefreshTokenByDevice).toHaveBeenCalledWith(
            mockUserId,
            mockDeviceId,
        );
        expect(result).toBe(true);
    });

    it('should throw error if token is invalid', async () => {
        (verifyJWT as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        await expect(
            authService.signOut(mockAccessToken, mockDeviceId),
        ).rejects.toThrow(new Error('Invalid token'));

        expect(verifyJWT).toHaveBeenCalledWith(mockAccessToken, 'test_secret');
        expect(userRepo.getUserById).not.toHaveBeenCalled();
        expect(authRepo.deleteRefreshTokenByDevice).not.toHaveBeenCalled();
    });

    it('should throw error if user is not found', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUserId });
        (userRepo.getUserById as jest.Mock).mockResolvedValue(null);

        await expect(
            authService.signOut(mockAccessToken, mockDeviceId),
        ).rejects.toThrow(new CustomError('User not found', 404));

        expect(userRepo.getUserById).toHaveBeenCalledWith(mockUserId);
        expect(authRepo.deleteRefreshTokenByDevice).not.toHaveBeenCalled();
    });

    it('should throw error if refresh token is not found', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUserId });
        (userRepo.getUserById as jest.Mock).mockResolvedValue({
            id: mockUserId,
        });
        (authRepo.deleteRefreshTokenByDevice as jest.Mock).mockResolvedValue(
            false,
        );

        await expect(
            authService.signOut(mockAccessToken, mockDeviceId),
        ).rejects.toThrow(new CustomError('Refresh token not found', 404));

        expect(authRepo.deleteRefreshTokenByDevice).toHaveBeenCalledWith(
            mockUserId,
            mockDeviceId,
        );
    });
});

describe('refreshTokenService', () => {
    const mockUser = {
        id: 'user123',
        email: 'test@example.com',
    };

    const mockRefreshToken = {
        id: 'token123',
        user_id: mockUser.id,
        refresh_token: 'valid_refresh_token',
        device_id: 'device123',
        device_name: 'iPhone',
        device_model: 'iPhone 12',
        refresh_token_expiration: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
        created_at: undefined,
        updated_at: undefined,
    };

    it('should return a new access token if refresh token is valid', async () => {
        (userRepo.getUserById as jest.Mock).mockResolvedValue(mockUser);
        (authRepo.getRefreshTokenByDevice as jest.Mock).mockResolvedValue(
            mockRefreshToken,
        );

        (generateJWT as jest.Mock).mockImplementation(payload => {
            return 'new_access_token';
        });

        const result = await authService.refreshToken(
            mockUser.id,
            'device123',
            'valid_refresh_token',
        );

        expect(result).toEqual({ access_token: 'new_access_token' });
        expect(generateJWT).toHaveBeenCalledWith(
            { userId: mockUser.id },
            expect.any(String),
            '15m',
        );
    });

    it('should throw an error if user is not found', async () => {
        (userRepo.getUserById as jest.Mock).mockResolvedValue(null);

        await expect(
            authService.refreshToken(
                'invalidUser',
                'device123',
                'refreshToken',
            ),
        ).rejects.toThrow(new CustomError('User not found', 404));
    });

    it('should throw an error if refresh token is not found or does not match', async () => {
        (userRepo.getUserById as jest.Mock).mockResolvedValue(mockUser);
        (authRepo.getRefreshTokenByDevice as jest.Mock).mockResolvedValue(null);

        await expect(
            authService.refreshToken(mockUser.id, 'device123', 'invalid_token'),
        ).rejects.toThrow(new CustomError('Invalid refresh token', 401));
    });

    it('should throw an error if refresh token is expired', async () => {
        const expiredToken = {
            ...mockRefreshToken,
            refresh_token_expiration: new Date(Date.now() - 1000),
        };

        (userRepo.getUserById as jest.Mock).mockResolvedValue(mockUser);
        (authRepo.getRefreshTokenByDevice as jest.Mock).mockResolvedValue(
            expiredToken,
        );

        await expect(
            authService.refreshToken(
                mockUser.id,
                'device123',
                'valid_refresh_token',
            ),
        ).rejects.toThrow(new CustomError('Refresh token has expired', 401));
    });
});

describe('resetPasswordService', () => {
    it('should throw an error if email is invalid', async () => {
        const invalidData = { email: 'invalidemail', password: 'Valid123!' };
        const validationError = {
            details: [{ message: 'Email format is invalid' }],
        };

        jest.spyOn(
            require('../../../../src/modules/user/auth/auth.validator'),
            'validateResetPassword',
        ).mockReturnValue({ error: validationError });

        await expect(authService.resetPassword(invalidData)).rejects.toThrow(
            new CustomError('Email format is invalid', 400),
        );
    });

    it('should throw an error if password does not meet criteria', async () => {
        const invalidData = { email: 'test@example.com', password: 'short' };
        const validationError = {
            details: [{ message: 'Password must have at least 8 characters.' }],
        };

        jest.spyOn(
            require('../../../../src/modules/user/auth/auth.validator'),
            'validateResetPassword',
        ).mockReturnValue({ error: validationError });

        await expect(authService.resetPassword(invalidData)).rejects.toThrow(
            new CustomError('Password must have at least 8 characters.', 400),
        );
    });

    it('should throw error if user is not found', async () => {
        jest.spyOn(
            require('../../../../src/modules/user/auth/auth.validator'),
            'validateResetPassword',
        ).mockReturnValue({ error: null });

        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(null);

        await expect(
            authService.resetPassword({
                email: 'notfound@example.com',
                password: 'NewPassword123!',
            }),
        ).rejects.toThrow(new CustomError('User not found', 404));
    });

    it('should update the password if user exists', async () => {
        const userMock = { email: 'test@example.com' };
        (userRepo.getUserByEmail as jest.Mock).mockResolvedValue(userMock);
        (authRepo.resetPassword as jest.Mock).mockResolvedValue(true);

        const result = await authService.resetPassword({
            email: 'test@example.com',
            password: 'NewPassword123!',
        });

        expect(userRepo.getUserByEmail).toHaveBeenCalledWith(
            'test@example.com',
        );
        expect(authRepo.resetPassword).toHaveBeenCalledWith(
            userMock.email,
            expect.any(Object),
        );
        expect(result).toBe(true);
    });
});
