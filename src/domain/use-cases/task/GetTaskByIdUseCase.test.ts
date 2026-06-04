import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { GetTaskByIdUseCase } from './GetTaskByIdUseCase.js';
import { randomUUID } from 'node:crypto';
import { Task } from '../../entities/Task.js';
import { TASK_STATUS } from '../../value-objects/TaskStatus.js';
import { PRIORITY } from '../../value-objects/Priority.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { NotFoundError } from '../../errors/NotFoundError.js';

let taskRepository: ITaskRepository;

let getTaskByIdUseCase: GetTaskByIdUseCase;

describe('GetTaskByIdUseCase', () => {
  beforeEach(() => {
    taskRepository = {
      findByProjectId: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
    };

    getTaskByIdUseCase = new GetTaskByIdUseCase(taskRepository);
  });

  const mockTaskId = randomUUID();
  const mockTask = Task.create({
    id: mockTaskId,
    title: 'title',
    description: 'description',
    projectId: 'projectId',
    status: TASK_STATUS.TODO,
    priority: PRIORITY.MEDIUM,
    createdAt: new Date(),
  });

  describe('execute()', () => {
    it('should throw an  error  if the id si empty', async () => {
      const result = getTaskByIdUseCase.execute('');
      await expect(result).rejects.toThrow(new ValidationError('id is required'));
    });

    it('should throw an error if the task was not found', async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);
      const result = getTaskByIdUseCase.execute(mockTaskId);
      await expect(result).rejects.toThrow(new NotFoundError('task not found'));
      expect(taskRepository.findById).toHaveBeenCalledWith(mockTaskId);
    });

    it('should return the found task', async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);

      const result = await getTaskByIdUseCase.execute(mockTaskId);

      expect(result).toBeInstanceOf(Task);
      expect(taskRepository.findById).toHaveBeenCalledWith(mockTaskId);
    });
  });
});
