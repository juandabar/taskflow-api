import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Comment } from '../../entities/Comment.js';
import { Task } from '../../entities/Task.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ICommentRepository } from '../../ports/driven/ICommentRepository.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { PRIORITY } from '../../value-objects/Priority.js';
import { TASK_STATUS } from '../../value-objects/TaskStatus.js';
import { AddCommentUseCase } from './AddCommentUseCase.js';

let commentRepository: ICommentRepository;
let addCommentUseCase: AddCommentUseCase;
let taskRepository: ITaskRepository;

describe('AddCommentUseCase', () => {
  beforeEach(() => {
    commentRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    taskRepository = {
      findByProjectId: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
    };

    addCommentUseCase = new AddCommentUseCase(commentRepository, taskRepository);
  });

  const mockTask = {
    id: randomUUID(),
    title: 'title',
    description: 'description',
    projectId: 'projectId',
    assigneeId: 'assigneeId',
    status: TASK_STATUS.TODO,
    priority: PRIORITY.MEDIUM,
    createdAt: new Date(),
  };

  const mockInput = {
    content: 'content',
    taskId: mockTask.id,
    authorId: 'authorId',
  };

  describe('execute()', () => {
    it('should throw an error if the content is empty', async () => {
      const project = Task.create(mockTask);
      vi.mocked(taskRepository.findById).mockResolvedValue(project);
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
      const project = Task.create(mockTask);
      vi.mocked(taskRepository.findById).mockResolvedValue(project);
      const result = addCommentUseCase.execute({
        ...mockInput,
        authorId: '',
      });
      await expect(result).rejects.toThrow(new ValidationError('authorId is required'));
    });

    it('should return the new comment', async () => {
      const project = Task.create(mockTask);
      vi.mocked(taskRepository.findById).mockResolvedValue(project);
      const result = await addCommentUseCase.execute(mockInput);

      expect(result).toBeInstanceOf(Comment);
      expect(commentRepository.save).toHaveBeenCalled();
    });
  });
});
