import { User } from '@/interfaces/user.interface';
import { validateSignIn, validateSignUp } from './auth.validator';
import { compareSync, hash } from 'bcrypt';
import { generateJWT } from '@/middlewares/jwt.service';
import { JWT_ACCESS_TOKEN_SECRET } from '@/config';
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

        const otpCode = generateOTP(6)
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

        const hashedPassword = await hash(userData.password, 10);
        const newUserData = await authRepo.createUser({
            ...userData,
            password: hashedPassword,
            role_id: 2,
            otp_code: otpCode,
            otp_expiration: otpExpiration
        });

        Promise.resolve().then(() => {
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
        }).catch((error) => {
            logger.error(`Error sending email: ${error}`);
        })

        return { user: newUserData };
    },

    signIn: async (userData: User) => {
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
        );

        return { user, accessToken };
    },
};

export default authService;
