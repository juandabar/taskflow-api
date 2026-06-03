import { beforeEach, describe, it, expect, vi } from 'vitest';
import { DeleteCommentUseCase } from './DeleteCommentUseCase.js';
import { ICommentRepository } from '../../ports/driven/ICommentRepository.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { randomUUID } from 'node:crypto';
import { Comment } from '../../entities/Comment.js';
import { USER_ROLE } from '../../value-objects/UserRole.js';
import { User } from '../../entities/User.js';
import { ForbiddenError } from '../../errors/ForbiddenError.js';

let mockCommentRepository: ICommentRepository;
let mockUserRepository: IUserRepository;

let deleteCommentUseCase: DeleteCommentUseCase;

describe('DeleteCommentUseCase', () => {
  beforeEach(() => {
    mockCommentRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    mockUserRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn(),
    };

    deleteCommentUseCase = new DeleteCommentUseCase(mockCommentRepository, mockUserRepository);
  });

  describe('execute()', () => {
    const inputComment = {
      id: randomUUID(),
      content: 'content',
      taskId: 'taskId',
      authorId: 'authorId',
      createdAt: new Date(),
    };

    const mockComment = Comment.create(inputComment);

    const inputUser = {
      id: randomUUID(),
      name: 'name',
      email: 'email@email.com',
      passwordHash: 'passwordHash',
      role: USER_ROLE.MEMBER,
      createdAt: new Date(),
    };

    const mockUser = User.create(inputUser);

    it('should throw an error when commentId is empty', async () => {
      const result = deleteCommentUseCase.execute('', mockUser.id);

      await expect(result).rejects.toThrow(new ValidationError('commentId is required'));
    });

    it('should throw an error when userId is empty', async () => {
      const result = deleteCommentUseCase.execute(mockComment.id, '');

      await expect(result).rejects.toThrow(new ValidationError('userId is required'));
    });

    it('should throw an error when the comment has not been found', async () => {
      vi.mocked(mockCommentRepository.findById).mockResolvedValue(null);

      const result = deleteCommentUseCase.execute(mockComment.id, mockUser.id);
      await expect(result).rejects.toThrow(new NotFoundError('comment not found'));
      expect(mockCommentRepository.findById).toHaveBeenCalledWith(mockComment.id);
    });

    it('should throw an error when the user was not found', async () => {
      vi.mocked(mockCommentRepository.findById).mockResolvedValue(mockComment);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      const result = deleteCommentUseCase.execute(mockComment.id, mockUser.id);

      await expect(result).rejects.toThrow(new NotFoundError('user not found'));
      expect(mockCommentRepository.findById).toHaveBeenCalledWith(mockComment.id);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw an error when trying to delete a comment that is not yours', async () => {
      vi.mocked(mockCommentRepository.findById).mockResolvedValue(mockComment);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      const result = deleteCommentUseCase.execute(mockComment.id, mockUser.id);

      await expect(result).rejects.toThrow(
        new ForbiddenError(
          `the comment can only be deleted by its owner or by an ${USER_ROLE.ADMIN}`,
        ),
      );
      expect(mockCommentRepository.findById).toHaveBeenCalledWith(mockComment.id);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockCommentRepository.delete).not.toHaveBeenCalled();
    });

    it('should be able to delete the comment if you own it', async () => {
      const mockComment = Comment.create({
        ...inputComment,
        authorId: mockUser.id,
      });

      vi.mocked(mockCommentRepository.findById).mockResolvedValue(mockComment);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      await deleteCommentUseCase.execute(mockComment.id, mockUser.id);

      expect(mockCommentRepository.delete).toHaveBeenCalledWith(mockComment.id);
    });

    it('should be able to delete a comment that is not yours if you are an admin', async () => {
      const mockUser = User.create({
        ...inputUser,
        role: USER_ROLE.ADMIN,
      });

      vi.mocked(mockCommentRepository.findById).mockResolvedValue(mockComment);
      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      await deleteCommentUseCase.execute(mockComment.id, mockUser.id);

      expect(mockCommentRepository.delete).toHaveBeenCalledWith(mockComment.id);
    });
  });
});
