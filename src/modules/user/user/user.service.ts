import { CustomError } from '@/utils/custom-error';
import { verifyJWT } from '@/middlewares/jwt.service';
import { JWT_ACCESS_TOKEN_SECRET } from '@/config';
import userRepo from './user.repo';

const userService = {
    getUserProfile: async (accessToken: string) => {
        const decodeToken = await verifyJWT(
            accessToken,
            JWT_ACCESS_TOKEN_SECRET as string,
        );

        const userId = decodeToken.userId;

        const user = await userRepo.getUserProfile(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }

        return user;
    },
};

export default userService;
