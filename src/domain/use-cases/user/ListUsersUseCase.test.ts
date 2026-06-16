import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from '../../entities/User.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';
import { IListUsersUseCase } from '../../ports/driving/IListUsersUseCase.js';
import { USER_ROLE } from '../../value-objects/UserRole.js';
import { ListUsersUseCase } from './ListUsersUseCase.js';

let listUsersUseCase: IListUsersUseCase;
let userRepository: IUserRepository;

const mockUser = {
  id: '123-abc',
  name: 'juan',
  email: 'juan@test.com',
  passwordHash: 'aasd1as1d56as1d56as16',
  role: USER_ROLE.ADMIN,
  createdAt: new Date(),
};

describe('ListUsersUseCase', () => {
  beforeEach(() => {
    userRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn(),
    };

    listUsersUseCase = new ListUsersUseCase(userRepository);
  });

  describe('execute()', () => {
    it('should return an empty array if there are no registered users', async () => {
      vi.mocked(userRepository.findAll).mockResolvedValue([]);
      const result = await listUsersUseCase.execute();
      expect(result).toEqual([]);
    });

    it('should return an array with the found users', async () => {
      const user = User.create(mockUser);
      vi.mocked(userRepository.findAll).mockResolvedValue([user]);
      const result = await listUsersUseCase.execute();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual(user);
    });
  });
});
