import { Request, Response, NextFunction } from 'express';
import roleController from '../../../../src/modules/user/role/role.controller';
import roleService from '../../../../src/modules/user/role/role.service';

jest.mock('../../../../src/modules/user/role/role.service', () => ({
    create: jest.fn(),
    delete: jest.fn(),
    getRoles: jest.fn(),
    getRoleById: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('createRoleController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { body: { role_name: 'Admin' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 201 and response data on successful role creation', async () => {
        const mockRole = { id: 1, role_name: 'Admin' };
        (roleService.create as jest.Mock).mockResolvedValue({ role: mockRole });

        await roleController.create(req as Request, res as Response, next);

        expect(roleService.create).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Successfully created role',
            data: mockRole,
        });
    });

    it('should call next with error if service throws an error', async () => {
        const error = new Error('Service error');
        (roleService.create as jest.Mock).mockRejectedValue(error);

        await roleController.create(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('deleteRoleController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { params: { id: '1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 200 and a success message when the role is deleted', async () => {
        (roleService.delete as jest.Mock).mockResolvedValue({
            message: 'Successfully deleted role',
        });

        await roleController.delete(req as Request, res as Response, next);

        expect(roleService.delete).toHaveBeenCalledWith(1);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Successfully deleted role',
        });
    });

    it('should call next with error if roleService.delete throws an error', async () => {
        const error = new Error('Role not found');
        (roleService.delete as jest.Mock).mockRejectedValue(error);

        await roleController.delete(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('getRolesController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 200 and response data on successful role fetch', async () => {
        const mockRoles = [
            { id: 1, role_name: 'Admin' },
            { id: 2, role_name: 'User' },
        ];

        (roleService.getRoles as jest.Mock).mockResolvedValue({
            roles: mockRoles,
        });

        await roleController.getRoles(req as Request, res as Response, next);

        expect(roleService.getRoles).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Successfully fetched roles',
            data: mockRoles,
        });
    });

    it('should call next with error if roleService.getRoles throws an error', async () => {
        const error = new Error('Roles not found');

        (roleService.getRoles as jest.Mock).mockRejectedValue(error);

        await roleController.getRoles(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('getRoleByIdController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { params: { id: '1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 200 and response data when the role is fetched successfully', async () => {
        const mockRole = { id: 1, role_name: 'Admin' };

        (roleService.getRoleById as jest.Mock).mockResolvedValue({
            role: mockRole,
        });

        await roleController.getRoleById(req as Request, res as Response, next);

        expect(roleService.getRoleById).toHaveBeenCalledWith(1);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Successfully fetched role',
            data: mockRole,
        });
    });

    it('should call next with error if roleService.getRoleById throws an error', async () => {
        const error = new Error('Role not found');

        (roleService.getRoleById as jest.Mock).mockRejectedValue(error);

        await roleController.getRoleById(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
