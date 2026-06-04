import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { UpdateTaskStatusUseCase } from './UpdateTaskStatusUseCase.js';
import { randomUUID } from 'node:crypto';
import { Task } from '../../entities/Task.js';
import { TASK_STATUS } from '../../value-objects/TaskStatus.js';
import { PRIORITY } from '../../value-objects/Priority.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { NotFoundError } from '../../errors/NotFoundError.js';

let taskRepository: ITaskRepository;

let updateTaskStatusUseCase: UpdateTaskStatusUseCase;

describe('UpdateTaskStatusUseCase', () => {
  beforeEach(() => {
    taskRepository = {
      findByProjectId: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
    };

    updateTaskStatusUseCase = new UpdateTaskStatusUseCase(taskRepository);
  });

  const mockProjectId = randomUUID();
  const mockTaskId = randomUUID();
  const mockTask = Task.create({
    id: mockTaskId,
    title: 'title',
    description: 'description',
    projectId: mockProjectId,
    status: TASK_STATUS.TODO,
    priority: PRIORITY.MEDIUM,
    createdAt: new Date(),
  });

  const input = {
    taskId: '',
    status: TASK_STATUS.IN_PROGRESS,
  };

  describe('execute()', () => {
    it('should throw an error if the taskId is empty', async () => {
      const result = updateTaskStatusUseCase.execute(input);

      await expect(result).rejects.toThrow(new ValidationError('taskId is required'));
    });

    it('should throw an error if the task was not found', async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);

      const result = updateTaskStatusUseCase.execute({ ...input, taskId: mockTaskId });
      await expect(result).rejects.toThrow(new NotFoundError('task not found'));
      expect(taskRepository.findById).toHaveBeenCalledWith(mockTaskId);
      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it('should update the status correctly', async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);

      await updateTaskStatusUseCase.execute({ ...input, taskId: mockTaskId });

      expect(taskRepository.update).toHaveBeenCalledWith(mockTask);
      expect(mockTask.status).toBe(TASK_STATUS.IN_PROGRESS);
      expect(taskRepository.findById).toHaveBeenCalledWith(mockTaskId);
    });
  });
});
