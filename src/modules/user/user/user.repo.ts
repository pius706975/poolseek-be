import { DB } from '@/database';
import { User } from '@/interfaces/user.interface';

const userRepo = {
    getUserProfile: async (
        userId: string | undefined,
    ): Promise<User | null> => {
        return await DB.Users.findOne({ where: { id: userId } });
    },
};

export default userRepo;
