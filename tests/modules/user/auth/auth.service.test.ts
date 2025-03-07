import authService from '../../../../src/modules/user/auth/auth.service';
import { CustomError } from '../../../../src/utils/custom-error';
import { User } from '../../../../src/interfaces/user.interface';
import authRepo from '../../../../src/modules/user/auth/auth.repo';
import { DB } from '../../../../src/database';
import { hash, compareSync } from 'bcrypt';
import {
    validateSignUp,
    validateSignIn,
} from '../../../../src/modules/user/auth/auth.validator';
import { generateJWT } from '../../../../src/middlewares/jwt.service';
import userRepo from '../../../../src/modules/user/user/user.repo';
import sendEmail from '../../../../src/utils/nodemailer';
import generateOTP from '../../../../src/utils/generate-otp';

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
            'OTP verification code',
            'Your OTP code.',
            'Use the following OTP code to complete your verification:',
            `<h2>123456</h2>`,
            'This code is valid for 10 minutes. Please do not share it with anyone.',
            `If you didn't request this code, please ignore this email.`,
            `${new Date().getFullYear().toString()}`,
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
            mockDevice.device_model
        );

        expect(userRepo.getUserByEmail).toHaveBeenCalledWith(
            'test@example.com',
        );
        expect(generateJWT).toHaveBeenCalled();
        expect(result).toEqual({
            user: mockUser,
            accessToken: 'mocked_access_token',
            refreshToken: 'mocked_access_token',
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
                mockDevice.device_model
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
                mockDevice.device_model
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
                mockDevice.device_model
            ),
        ).rejects.toThrow('Email and password are required');
    });
});
