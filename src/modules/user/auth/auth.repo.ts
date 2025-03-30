import { DB } from '@/database';
import { RefreshToken } from '@/interfaces/refresh.token.interfaces';
import { User } from '@/interfaces/user.interface';

const authRepo = {
    createUser: async (userData: User): Promise<User> => {
        return await DB.Users.create(userData);
    },

    createAndUpdateRefreshToken: async (
        userId: string,
        refreshToken: string,
        deviceId: string,
        deviceName: string,
        deviceModel: string,
        refreshTokenExpiration: Date,
    ) => {
        const existingRefreshToken = await authRepo.getRefreshTokenByDevice(
            userId,
            deviceId,
        );

        if (existingRefreshToken) {
            return await DB.RefreshTokens.update(
                { refresh_token: refreshToken },
                { where: { user_id: userId, device_id: deviceId } },
            );
        } else {
            return await DB.RefreshTokens.create({
                user_id: userId,
                refresh_token: refreshToken,
                device_id: deviceId,
                device_name: deviceName,
                device_model: deviceModel,
                refresh_token_expiration: refreshTokenExpiration,
            });
        }
    },

    deleteRefreshTokenByDevice: async (userId: string, deviceId: string) => {
        return await DB.RefreshTokens.destroy({
            where: {
                user_id: userId,
                device_id: deviceId,
            },
        });
    },

    resetPassword: async (email: string, userData: { password: string }) => {
        return await DB.Users.update(userData, {
            where: { email },
        });
    },

    getRefreshTokenByDevice: async (
        userId: string,
        deviceId: string,
    ): Promise<RefreshToken | null> => {
        return await DB.RefreshTokens.findOne({
            where: {
                user_id: userId,
                device_id: deviceId,
            },
        });
    },
};

export default authRepo;
