import { beforeEach, describe, it, expect, vi } from 'vitest';
import { AddCommentUseCase } from './AddCommentUseCase.js';
import { ICommentRepository } from '../../ports/driven/ICommentRepository.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { Comment } from '../../entities/Comment.js';

let commentRepository: ICommentRepository;
let addCommentUseCase: AddCommentUseCase;

describe('AddCommentUseCase', () => {
  beforeEach(() => {
    commentRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    addCommentUseCase = new AddCommentUseCase(commentRepository);
  });

  const mockInput = {
    content: 'content',
    taskId: 'taskId',
    authorId: 'authorId',
  };

  describe('execute()', () => {
    it('should throw an error if the content is empty', async () => {
      const result = addCommentUseCase.execute({
        ...mockInput,
        content: '',
      });
      await expect(result).rejects.toThrow(new ValidationError('content is required'));
    });

    it('should throw an error if the taskId is empty', async () => {
      const result = addCommentUseCase.execute({
        ...mockInput,
        taskId: '',
      });
      await expect(result).rejects.toThrow(new ValidationError('taskId is required'));
    });

    it('should throw an error if the authorId is empty', async () => {
      const result = addCommentUseCase.execute({
        ...mockInput,
        authorId: '',
      });
      await expect(result).rejects.toThrow(new ValidationError('authorId is required'));
    });

    it('should return the new comment', async () => {
      const result = await addCommentUseCase.execute(mockInput);

      expect(result).toBeInstanceOf(Comment);
      expect(commentRepository.save).toHaveBeenCalled();
    });
  });
});
