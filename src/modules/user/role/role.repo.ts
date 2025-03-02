import { DB } from '@/database';
import { Role } from '@/interfaces/role.interface';

const roleRepo = {
    create: async (roleData: Role): Promise<Role> => {
        return await DB.Role.create(roleData);
    },

    findRoles: async () => {
        return await DB.Role.findAll();
    },

    findRoleById: async (id: number) => {
        return await DB.Role.findOne({ where: { id } });
    },

    delete: async (id: number) => {
        return await DB.Role.destroy({ where: { id } });
    }
};

export default roleRepo;
