import { beforeEach, describe, it, expect, vi } from 'vitest';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';
import { IPasswordHasher } from '../../ports/driven/IPasswordHasher.js';
import { RegisterUserUseCase } from './RegisterUserUseCase.js';
import { randomUUID } from 'node:crypto';
import { USER_ROLE } from '../../value-objects/UserRole.js';
import { User } from '../../entities/User.js';
import { ConflictError } from '../../errors/ConflictError.js';

let mockUserRepository: IUserRepository;
let mockPasswordHasher: IPasswordHasher;
let mockRegisterUserUseCase: RegisterUserUseCase;

const mockUser = {
  id: randomUUID(),
  name: 'name',
  email: 'email@email.com',
  passwordHash: 'passwordHash',
  role: USER_ROLE.MEMBER,
  createdAt: new Date(),
} as User;

describe('RegisterUserUseCase', () => {
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

    mockRegisterUserUseCase = new RegisterUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  describe('execute()', () => {
    it('should throw an error if the email is already registered', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);

      const mockInput = {
        name: 'name',
        email: mockUser.email,
        password: 'password',
        role: USER_ROLE.MEMBER,
      };

      await expect(mockRegisterUserUseCase.execute(mockInput)).rejects.toThrow(
        new ConflictError('The email already exists'),
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should return the created user', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockPasswordHasher.hash).mockResolvedValue('123456-abcdefg');

      const user = await mockRegisterUserUseCase.execute({
        name: 'name',
        email: mockUser.email,
        password: 'password',
        role: USER_ROLE.MEMBER,
      });

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password');

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
      expect(user).toBeDefined();
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe(mockUser.email);
    });
  });
});
