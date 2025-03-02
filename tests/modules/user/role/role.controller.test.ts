import { Request, Response, NextFunction } from 'express';
import roleController from '../../../../src/modules/user/role/role.controller';
import roleService from '../../../../src/modules/user/role/role.service';

jest.mock('../../../../src/modules/user/role/role.service', () => ({
    create: jest.fn(),
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
    })

    it('should call next with error if service throws an error', async () => {
        const error = new Error('Service error');
        (roleService.create as jest.Mock).mockRejectedValue(error);

        await roleController.create(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    })
})