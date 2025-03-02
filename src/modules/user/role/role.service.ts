import { Role } from '@/interfaces/role.interface';
import { validateCreateRole } from './role.validator';
import { CustomError } from '@/utils/custom-error';
import roleRepo from './role.repo';

const roleService = {
    create: async (roleData: Role) => {
        const { error } = validateCreateRole(roleData);
        if (error) throw new CustomError(error.details[0].message, 400);

        const newRole = await roleRepo.create({ ...roleData });

        return {
            role: newRole,
        };
    },

    delete: async (id: number) => {
        const data = await roleRepo.findRoleById(id);
        if (!data) throw new CustomError('Role not found', 404);

        await roleRepo.delete(data.id);

        return {
            message: 'Successfully deleted role',
        };
    },

    getRoles: async () => {
        const data = await roleRepo.findRoles();
        if (data.length <= 0) throw new CustomError('Roles not found', 404);

        return {
            roles: data,
        };
    },

    getRoleById: async (id: number) => {
        const data = await roleRepo.findRoleById(id);
        if (!data) throw new CustomError('Role not found', 404);

        return {
            role: data,
        };
    },
};

export default roleService;
