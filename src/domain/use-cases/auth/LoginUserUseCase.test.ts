import { beforeEach, describe, it, expect, vi } from 'vitest';
import { LoginUserUseCase } from './LoginUserUseCase.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { UnauthorizedError } from '../../errors/UnauthorizedError.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';
import { IPasswordHasher } from '../../ports/driven/IPasswordHasher.js';
import { User } from '../../entities/User.js';
import { randomUUID } from 'node:crypto';
import { USER_ROLE } from '../../value-objects/UserRole.js';
import { IJwtService } from '../../ports/driven/IJwtService.js';

let mockUserRepository: IUserRepository;
let mockPasswordHasher: IPasswordHasher;
let mockJwtService: IJwtService;

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

    mockJwtService = {
      sign: vi.fn(),
      verify: vi.fn(),
    };

    mockLoginUserUseCase = new LoginUserUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockJwtService,
    );
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

    it("should return the token's logged-in user correctly", async () => {
      const mockUser = User.create({
        id: randomUUID(),
        name: 'name',
        email: 'email@email.com',
        passwordHash: 'passwordHash',
        role: USER_ROLE.MEMBER,
        createdAt: new Date(),
      });
      const mockToken = '12345-ABCDEF-98765';

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);
      vi.mocked(mockJwtService.sign).mockReturnValue(mockToken);

      const result = await mockLoginUserUseCase.execute(mockInput);

      expect(result).toBe(mockToken);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        mockInput.password,
        mockUser.passwordHash,
      );
    });
  });
});
