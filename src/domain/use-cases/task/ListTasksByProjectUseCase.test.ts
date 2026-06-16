import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Task } from '../../entities/Task.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { PRIORITY } from '../../value-objects/Priority.js';
import { TASK_STATUS } from '../../value-objects/TaskStatus.js';
import { ListTasksByProjectUseCase } from './ListTasksByProjectUseCase.js';

let taskRepository: ITaskRepository;
let projectRepository: IProjectRepository;

let listTasksByProjectUseCase: ListTasksByProjectUseCase;

describe('ListTasksByProjectUseCase', () => {
  beforeEach(() => {
    taskRepository = {
      findByProjectId: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
    };

    projectRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    listTasksByProjectUseCase = new ListTasksByProjectUseCase(taskRepository, projectRepository);
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

  describe('execute()', () => {
    it('should throw an error if the projectId is empty', async () => {
      const result = listTasksByProjectUseCase.execute({ projectId: '' });

      await expect(result).rejects.toThrow(new ValidationError('projectId is required'));
    });

    it('should return the array of found tasks', async () => {
      vi.mocked(taskRepository.findByProjectId).mockResolvedValue([mockTask]);
      const input = {
        projectId: mockProjectId,
        filters: {
          status: TASK_STATUS.TODO,
          priority: PRIORITY.MEDIUM,
        },
      };

      const result = await listTasksByProjectUseCase.execute(input);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeInstanceOf(Task);
      expect(taskRepository.findByProjectId).toHaveBeenCalledWith(input.projectId, input.filters);
    });
  });
});
