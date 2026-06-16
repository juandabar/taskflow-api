import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Task } from '../../entities/Task.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { PRIORITY } from '../../value-objects/Priority.js';
import { TASK_STATUS } from '../../value-objects/TaskStatus.js';
import { AssignTaskUseCase } from './AssignTaskUseCase.js';

let taskRepository: ITaskRepository;
let assignTaskUseCase: AssignTaskUseCase;

describe('AssignTaskUseCase', () => {
  beforeEach(() => {
    taskRepository = {
      findByProjectId: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
    };

    assignTaskUseCase = new AssignTaskUseCase(taskRepository);
  });

  const mockTask = Task.create({
    id: randomUUID(),
    title: 'title',
    description: 'description',
    projectId: 'projectId',
    status: TASK_STATUS.TODO,
    priority: PRIORITY.MEDIUM,
    createdAt: new Date(),
  });

  describe('execute()', () => {
    it('should throw an error if the taskId is empty', async () => {
      const result = assignTaskUseCase.execute('', 'userId');
      await expect(result).rejects.toThrow(new ValidationError('taskId is required'));
    });

    it('should throw an error if the userId is empty', async () => {
      const result = assignTaskUseCase.execute('taskId', '');
      await expect(result).rejects.toThrow(new ValidationError('userId is required'));
    });

    it('should throw an error if the task is not found', async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      const result = assignTaskUseCase.execute('taskId', 'userId');
      await expect(result).rejects.toThrow(new NotFoundError('task not found'));
    });

    it('should assign the task correctly', async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);

      const result = await assignTaskUseCase.execute(mockTask.id, 'userId');
      expect(mockTask.assigneeId).toBe('userId');
      expect(taskRepository.update).toHaveBeenCalledWith(mockTask);
      expect(result).toBeInstanceOf(Task);
    });
  });
});
