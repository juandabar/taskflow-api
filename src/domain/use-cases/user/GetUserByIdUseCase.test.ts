import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from '../../entities/User.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';
import { IGetUserByIdUseCase } from '../../ports/driving/IGetUserByIdUseCase.js';
import { USER_ROLE } from '../../value-objects/UserRole.js';
import { GetUserByIdUseCase } from './GetUserByIdUseCase.js';

let getUserByIdUseCase: IGetUserByIdUseCase;
let userRepository: IUserRepository;

const mockUser = {
  id: '123-abc',
  name: 'juan',
  email: 'juan@test.com',
  passwordHash: 'aasd1as1d56as1d56as16',
  role: USER_ROLE.ADMIN,
  createdAt: new Date(),
};

describe('GetUserByIdUseCase', () => {
  beforeEach(() => {
    userRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn(),
    };

    getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
  });

  describe('execute()', () => {
    it('should throw an error if name is not provided', async () => {
      const result = getUserByIdUseCase.execute('');

      await expect(result).rejects.toThrow(new ValidationError('id is required'));
    });

    it('should throw an error if the user was not found', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(null);
      const result = getUserByIdUseCase.execute('123-abc');

      await expect(result).rejects.toThrow(new NotFoundError('user not found'));
    });

    it('should return the found user', async () => {
      const user = User.create(mockUser);
      vi.mocked(userRepository.findById).mockResolvedValue(user);

      const result = await getUserByIdUseCase.execute('123-abc');
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('123-abc');
    });
  });
});
