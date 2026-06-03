import { beforeEach, describe, it, expect, vi } from 'vitest';
import { LoginUserUseCase } from './LoginUserUseCase.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { UnauthorizedError } from '../../errors/UnauthorizedError.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';
import { IPasswordHasher } from '../../ports/driven/IPasswordHasher.js';
import { User } from '../../entities/User.js';
import { randomUUID } from 'node:crypto';
import { USER_ROLE } from '../../value-objects/UserRole.js';

let mockUserRepository: IUserRepository;
let mockPasswordHasher: IPasswordHasher;

let mockLoginUserUseCase: LoginUserUseCase;

describe('LoginUserUseCase', () => {
  beforeEach(() => {
    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn(),
    };

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    mockLoginUserUseCase = new LoginUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  describe('execute()', () => {
    const mockInput = {
      email: 'email@email.com',
      password: 'password',
    };

    it('should throw an error if the user was not found', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      const result = mockLoginUserUseCase.execute(mockInput);

      await expect(result).rejects.toThrow(
        new NotFoundError('the entered credentials are incorrect'),
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
    });

    it('should throw an error if the password is incorrect', async () => {
      const mockUser = User.create({
        id: randomUUID(),
        name: 'name',
        email: 'email@email.com',
        passwordHash: 'passwordHash',
        role: USER_ROLE.MEMBER,
        createdAt: new Date(),
      });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(false);

      const result = mockLoginUserUseCase.execute(mockInput);

      await expect(result).rejects.toThrow(
        new UnauthorizedError('the entered credentials are incorrect'),
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        mockInput.password,
        mockUser.passwordHash,
      );
    });

    it('should return the logged-in user correctly', async () => {
      const mockUser = User.create({
        id: randomUUID(),
        name: 'name',
        email: 'email@email.com',
        passwordHash: 'passwordHash',
        role: USER_ROLE.MEMBER,
        createdAt: new Date(),
      });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);

      const result = await mockLoginUserUseCase.execute(mockInput);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(User);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        mockInput.password,
        mockUser.passwordHash,
      );
    });
  });
});
