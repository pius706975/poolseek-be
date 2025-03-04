import { DB } from '@/database';
import { User } from '@/interfaces/user.interface';

const userRepo = {
    update: async (userId: string | undefined, userData: User) => {
        return await DB.Users.update(userData, { where: { id: userId } });
    },

    getUserByEmail: async (email: string): Promise<User | null> => {
        return await DB.Users.findOne({ where: { email } });
    },

    getUserProfile: async (
        userId: string | undefined,
    ): Promise<User | null> => {
        return await DB.Users.findOne({ where: { id: userId } });
    },
};

export default userRepo;
