import { User } from '@/interfaces/user.interface';
import { validateSignIn, validateSignUp } from './auth.validator';
import { compareSync, hash } from 'bcrypt';
import { generateJWT, verifyJWT } from '@/middlewares/jwt.service';
import { JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET } from '@/config';
import { CustomError } from '@/utils/custom-error';
import authRepo from './auth.repo';
import generateOTP from '@/utils/generate-otp';
import sendEmail from '@/utils/nodemailer';
import logger from '@/utils/logger';
import userRepo from '../user/user.repo';

const authService = {
    signUp: async (userData: User) => {
        const { error } = validateSignUp(userData);
        if (error) {
            throw new CustomError(error.details[0].message, 400);
        }

        const findUser = await userRepo.getUserByEmail(userData.email);
        if (findUser) {
            throw new CustomError(
                `Email ${userData.email} already exists`,
                409,
            );
        }

        const otpCode = generateOTP(6);
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

        const hashedPassword = await hash(userData.password, 10);
        const newUserData = await authRepo.createUser({
            ...userData,
            password: hashedPassword,
            role_id: 2,
            otp_code: otpCode,
            otp_expiration: otpExpiration,
        });

        Promise.resolve()
            .then(() => {
                sendEmail(
                    userData.email,
                    'OTP verification code',
                    `Your OTP code.`,
                    'Use the following OTP code to complete your verification:',
                    `<h2>${otpCode}</h2>`,
                    'This code is valid for 10 minutes. Please do not share it with anyone.',
                    `If you didn't request this code, please ignore this email.`,
                    `${new Date().getFullYear().toString()}`,
                );
            })
            .catch(error => {
                logger.error(`Error sending email: ${error}`);
            });

        return { user: newUserData };
    },

    signIn: async (
        userData: User,
        deviceId: string,
        deviceName: string,
        deviceModel: string,
    ) => {
        const { error } = validateSignIn(userData);
        if (error) {
            throw new CustomError(error.details[0].message, 400);
        }

        const user = await userRepo.getUserByEmail(userData.email);
        if (!user) {
            throw new CustomError('Email or password is invalid', 401);
        }

        const validPassword = compareSync(userData.password, user.password);
        if (!validPassword) {
            throw new CustomError('Email or password is invalid', 401);
        }

        const payload = {
            userId: user.id,
        };

        const accessToken = await generateJWT(
            payload,
            JWT_ACCESS_TOKEN_SECRET as string,
            '15m',
        );

        const refreshToken = await generateJWT(
            payload,
            JWT_REFRESH_TOKEN_SECRET as string,
            '7d',
        );

        const refreshTokenExpiredAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
        );

        await authRepo.createAndUpdateRefreshToken(
            user.id as string,
            refreshToken,
            deviceId,
            deviceName,
            deviceModel,
            refreshTokenExpiredAt,
        );

        return { user, access_token: accessToken, refresh_token: refreshToken };
    },

    signOut: async (accessToken: string, deviceId: string) => {
        const decodeToken = await verifyJWT(
            accessToken,
            JWT_ACCESS_TOKEN_SECRET as string,
        );

        const userId = decodeToken.userId;

        const user = await userRepo.getUserById(userId);
        if (!user) throw new CustomError('User not found', 404);

        const deleteRefreshToken = await authRepo.deleteRefreshTokenByDevice(
            user.id!,
            deviceId,
        );

        if (!deleteRefreshToken)
            throw new CustomError('Refresh token not found', 404);

        return deleteRefreshToken;
    },

    refreshToken: async (
        userId: string,
        deviceId: string,
        refreshToken: string,
    ) => {
        const user = await userRepo.getUserById(userId);
        if (!user) throw new CustomError('User not found', 404);

        const getRefreshToken = await authRepo.getRefreshTokenByDevice(
            user.id as string,
            deviceId,
        );
        if (!getRefreshToken || getRefreshToken.refresh_token !== refreshToken)
            throw new CustomError('Invalid refresh token', 401);

        const refreshTokenExpDate = getRefreshToken.refresh_token_expiration
            ? new Date(getRefreshToken.refresh_token_expiration)
            : null;

        const isExpired =
            refreshTokenExpDate && refreshTokenExpDate < new Date();

        if (isExpired) throw new CustomError('Refresh token has expired', 401);

        const payload = {
            userId: user.id,
        };

        const newAccessToken = await generateJWT(
            payload,
            JWT_ACCESS_TOKEN_SECRET as string,
            '15m',
        );

        return { access_token: newAccessToken };
    }
};

export default authService;
