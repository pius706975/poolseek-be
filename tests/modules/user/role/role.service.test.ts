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

beforeEach(() => {
    jest.clearAllMocks();
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

describe('deleteRoleService', () => {
    it('should delete a role successfully', async () => {
        const roleId = 1;
        const role = { id: roleId, role_name: 'admin' };

        (roleRepo.findRoleById as jest.Mock).mockResolvedValue(role);
        
        (roleRepo.delete as jest.Mock).mockResolvedValue(undefined);

        const result = await roleService.delete(roleId);

        expect(result).toEqual({
            message: 'Successfully deleted role',
        });

        expect(roleRepo.findRoleById).toHaveBeenCalledWith(roleId);
        expect(roleRepo.delete).toHaveBeenCalledWith(roleId);
    });

    it('should throw an error if the role is not found', async () => {
        const roleId = 1;
    
        (roleRepo.findRoleById as jest.Mock).mockResolvedValue(null);
    
        await expect(roleService.delete(roleId)).rejects.toThrow(
            new CustomError('Role not found', 404),
        );
    
        expect(roleRepo.findRoleById).toHaveBeenCalledWith(roleId);
    
        expect(roleRepo.delete).not.toHaveBeenCalled();
    });
});

describe('getRolesService', () => {
    it('should return roles successfully', async () => {
        const roles = [
            { id: 1, role_name: 'admin' },
            { id: 2, role_name: 'user' },
        ];

        (roleRepo.findRoles as jest.Mock).mockResolvedValue(roles);

        const result = await roleService.getRoles();

        expect(result).toEqual({
            roles,
        });

        expect(roleRepo.findRoles).toHaveBeenCalled();
    });

    it('should throw an error if no roles are found', async () => {
        (roleRepo.findRoles as jest.Mock).mockResolvedValue([]);

        await expect(roleService.getRoles()).rejects.toThrow(
            new CustomError('Roles not found', 404),
        );

        expect(roleRepo.findRoles).toHaveBeenCalled();
    });
});

describe('getRoleByIdService', () => {
    it('should return the role when found', async () => {
        const roleId = 1;
        const role = { id: roleId, role_name: 'admin' };

        (roleRepo.findRoleById as jest.Mock).mockResolvedValue(role);

        const result = await roleService.getRoleById(roleId);

        expect(result).toEqual({
            role,
        });

        expect(roleRepo.findRoleById).toHaveBeenCalledWith(roleId);
    });

    it('should throw an error if the role is not found', async () => {
        const roleId = 1;

        (roleRepo.findRoleById as jest.Mock).mockResolvedValue(null);

        await expect(roleService.getRoleById(roleId)).rejects.toThrow(
            new CustomError('Role not found', 404),
        );

        expect(roleRepo.findRoleById).toHaveBeenCalledWith(roleId);
    });
});
