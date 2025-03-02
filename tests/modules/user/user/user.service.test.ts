import userService from '../../../../src/modules/user/user/user.service';
import { verifyJWT } from '../../../../src/middlewares/jwt.service';
import authRepo from '../../../../src/modules/user/user/user.repo';
import { CustomError } from '../../../../src/utils/custom-error';
import { JWT_ACCESS_TOKEN_SECRET } from '../../../../src/config/index';

jest.mock('../../../../src/middlewares/jwt.service');
jest.mock('../../../../src/modules/user/user/user.repo');
jest.mock('../../../../src/database', ()=>({
    DB: {
        sequelize: {
            close: jest.fn(),
            authenticate: jest.fn(),
        }
    }
}));

jest.mock('../../../../src/config/index', () => ({
    JWT_ACCESS_TOKEN_SECRET: 'mock_secret_key'
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('getUserProfileService', () => {
    const mockAccessToken = 'mockAccessToken';
    const mockUserId = 'user123';
    const mockUser = { id: mockUserId, email: 'user@example.com', username: 'user' };

    it('should return user profile when accessToken is valid', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUserId });
        (authRepo.getUserProfile as jest.Mock).mockResolvedValue(mockUser);

        const result = await userService.getUserProfile(mockAccessToken);

        expect(verifyJWT).toHaveBeenCalledWith(mockAccessToken, JWT_ACCESS_TOKEN_SECRET);
        expect(authRepo.getUserProfile).toHaveBeenCalledWith(mockUserId);
        expect(result).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
        (verifyJWT as jest.Mock).mockResolvedValue({ userId: mockUserId });
        (authRepo.getUserProfile as jest.Mock).mockResolvedValue(null);

        await expect(userService.getUserProfile(mockAccessToken)).rejects.toThrow(
            new CustomError('User not found', 404),
        );

        expect(verifyJWT).toHaveBeenCalledWith(mockAccessToken, expect.any(String));
        expect(authRepo.getUserProfile).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw an error if token verification fails', async () => {
        (verifyJWT as jest.Mock).mockRejectedValue(new Error('Invalid token'));
    
        await expect(userService.getUserProfile(mockAccessToken)).rejects.toThrow('Invalid token');
    
        expect(verifyJWT).toHaveBeenCalledWith(mockAccessToken, expect.any(String));
        expect(authRepo.getUserProfile).not.toHaveBeenCalled();
    });
    
});
