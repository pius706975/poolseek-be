import roleService from '../../../../src/modules/user/role/role.service';
import { CustomError } from '../../../../src/utils/custom-error';
import roleRepo from '../../../../src/modules/user/role/role.repo';
import { Role } from '../../../../src/interfaces/role.interface';
import { DB } from '../../../../src/database';
import { validateCreateRole } from '../../../../src/modules/user/role/role.validator';

jest.mock('../../../../src/modules/user/role/role.repo');
jest.mock('../../../../src/database', () => ({
    DB: {
        sequelize: {
            close: jest.fn(),
            authenticate: jest.fn(),
        },
    },
}));

jest.mock('../../../../src/modules/user/role/role.validator', () => ({
    validateCreateRole: jest.fn(),
}));

afterAll(async () => {
    await DB.sequelize.close();
});

describe('createRoleService', () => {
    it('should create a new role', async () => {
        const roleData: Role = {
            role_name: 'Role Name',
            created_at: undefined,
            updated_at: undefined,
        };

        const newRole = {
            id: 1,
            role_name: 'samapos-admin',
        };

        (validateCreateRole as jest.Mock).mockReturnValue({ error: null });

        (roleRepo.create as jest.Mock).mockResolvedValue(newRole);

        const result = await roleService.create(roleData);

        expect(result).toEqual({ role: newRole });
    });

    it('should throw an error if validation fails', async () => {
        const roleData: Role = {
            role_name: 'Role Name',
            created_at: undefined,
            updated_at: undefined,
        };

        const validationError = {
            error: {
                details: [{ message: 'Role name is required' }],
            },
        };

        (validateCreateRole as jest.Mock).mockReturnValue(validationError);

        await expect(roleService.create(roleData)).rejects.toThrow(
            new CustomError('Role name is required', 400),
        );
    });
});
