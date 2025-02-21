import { signUpService } from '../../../src/modules/auth/auth.service';
import { CustomError } from '../../../src/utils/custom-error';
import repo from '../../../src/modules/auth/auth.repo';
import { User } from '../../../src/interfaces/user.interfaces';
import { DB } from '../../../src/database';
import { hash } from 'bcrypt';
import { validateSignUp } from '../../../src/modules/auth/auth.validator';

jest.mock('../../../src/modules/auth/auth.repo');
jest.mock('../../../src/database', () => ({
    DB: {
        sequelize: {
            close: jest.fn(),
            authenticate: jest.fn(),
        },
    },
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(() => Promise.resolve('hashedPassword')),
}));

jest.mock('../../../src/modules/auth/auth.validator', () => ({
    validateSignUp: jest.fn(),
}));

afterAll(async () => {
    await DB.sequelize.close();
});

describe('signUpService', () => {
    it('should throw error if email already exists', async () => {
        const userData: User = {
            email: 'existing@example.com',
            name: 'Existing User',
            username: 'existinguser',
            password: 'Password123!',
            created_at: undefined,
            updated_at: undefined,
        };

        (repo.findUserByEmail as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'existing@example.com',
        });

        (validateSignUp as jest.Mock).mockReturnValue({ error: null });

        await expect(signUpService(userData)).rejects.toThrow(
            new CustomError(`Email ${userData.email} already exists`, 409),
        );
    });

    it('should throw error if validation fails', async () => {
        const userData: User = {
            email: 'invalid-email',
            name: 'Invalid User',
            username: 'invaliduser',
            password: 'Password123!',
            created_at: undefined,
            updated_at: undefined,
        };

        const validationError = {
            details: [{ message: 'Email format is invalid' }],
        };
        (validateSignUp as jest.Mock).mockReturnValue({
            error: validationError,
        });

        await expect(signUpService(userData)).rejects.toThrow(
            new CustomError('Email format is invalid', 400),
        );
    });

    it('should create new user if email is available', async () => {
        const userData: User = {
            email: 'new@example.com',
            name: 'New User',
            username: 'newuser',
            password: 'Password123!',
            created_at: undefined,
            updated_at: undefined,
        };

        (repo.findUserByEmail as jest.Mock).mockResolvedValue(null);
        (validateSignUp as jest.Mock).mockReturnValue({ error: null });

        const newUser = {
            id: 1,
            email: 'new@example.com',
            username: 'new-username',
            password: 'hashedPassword',
        };

        (repo.createUser as jest.Mock).mockResolvedValue(newUser);

        const result = await signUpService(userData);
        expect(result).toEqual({ user: newUser });
        expect(hash).toHaveBeenCalledWith(userData.password, 10);
    });
});
