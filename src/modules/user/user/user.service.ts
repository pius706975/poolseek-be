import { CustomError } from '@/utils/custom-error';
import { verifyJWT } from '@/middlewares/jwt.service';
import { JWT_ACCESS_TOKEN_SECRET } from '@/config';
import userRepo from './user.repo';
import generateOTP from '@/utils/generate-otp';
import sendEmail from '@/utils/nodemailer';
import {
    validateSendOTP,
    validateUpdatePassword,
    validateVerifyOTP,
} from './user.validator';
import { User } from '@/interfaces/user.interface';
import logger from '@/utils/logger';
import { hash } from 'bcrypt';

const userService = {
    sendOTP: async (email: string) => {
        const { error } = validateSendOTP(email);
        if (error) throw new CustomError(error.details[0].message, 400);

        const user = await userRepo.getUserByEmail(email);
        if (!user) throw new CustomError('User not found', 404);

        const otpCode = generateOTP(6);
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

        const updatedUser = await userRepo.update(user.id, {
            ...user,
            otp_code: otpCode,
            otp_expiration: otpExpiration,
        });

        Promise.resolve()
            .then(() => {
                sendEmail(
                    email,
                    'One Time Password',
                    `Your OTP code.`,
                    `Hi, ${user.first_name}!<br><br>
                    Use the following OTP code to complete your verification:`,
                    `<h2>${otpCode}</h2>`,
                    'This code is valid for 10 minutes. Please do not share it with anyone.',
                    `If you didn't request this code, please ignore this email.`,
                    `${new Date().getFullYear().toString()}`,
                );
            })
            .catch(error => {
                logger.error(`Error sending email: ${error}`);
                throw new CustomError('Error sending OTP email', 500);
            });

        return updatedUser;
    },

    verifyOTP: async (userData: User) => {
        const { error } = validateVerifyOTP(userData);
        if (error) throw new CustomError(error.details[0].message, 400);

        const user = await userRepo.getUserByEmail(userData.email);
        if (!user) throw new CustomError('User not found', 404);

        if (user.otp_code !== userData.otp_code)
            throw new CustomError('Invalid OTP code', 400);

        const otpExpDate = user.otp_expiration
            ? new Date(user.otp_expiration)
            : null;

        const otpExpired = otpExpDate && otpExpDate < new Date();

        if (otpExpired) throw new CustomError('OTP code has expired', 400);

        const verifiedUser = await userRepo.update(user.id, {
            ...user,
            is_verified: true,
            otp_code: '',
        });

        return verifiedUser;
    },

    updatePassword: async (accessToken: string, userData: User) => {
        const { error } = validateUpdatePassword(userData);
        if (error) throw new CustomError(error.details[0].message, 400);

        const decodeToken = await verifyJWT(
            accessToken,
            JWT_ACCESS_TOKEN_SECRET as string,
        );

        const userId = decodeToken.userId;

        const user = await userRepo.getUserById(userId);
        if (!user) throw new CustomError('User not found', 404);

        const hashedPassword = await hash(userData.password, 10);

        const updatedPassword = await userRepo.update(user.id, {
            ...user,
            password: hashedPassword,
        });

        return updatedPassword;
    },

    getUserProfile: async (accessToken: string) => {
        const decodeToken = await verifyJWT(
            accessToken,
            JWT_ACCESS_TOKEN_SECRET as string,
        );

        const userId = decodeToken.userId;

        const user = await userRepo.getUserById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        return user;
    },
};

export default userService;
