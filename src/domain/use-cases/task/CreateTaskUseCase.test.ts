import { beforeEach, describe, it, expect, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { CreateTaskUseCase } from './CreateTaskUseCase.js';
import { PRIORITY } from '../../value-objects/Priority.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { Project } from '../../entities/Project.js';
import { PROJECT_STATUS } from '../../value-objects/ProjectStatus.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ConflictError } from '../../errors/ConflictError.js';
import { Task } from '../../entities/Task.js';

let taskRepository: ITaskRepository;
let projectRepository: IProjectRepository;

let createTaskUseCase: CreateTaskUseCase;

describe('CreateTaskUseCase', () => {
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

    createTaskUseCase = new CreateTaskUseCase(taskRepository, projectRepository);
  });

  const mockProjectId = randomUUID();

  const mockInput = {
    title: 'title',
    description: 'description',
    projectId: mockProjectId,
    priority: PRIORITY.MEDIUM,
  };

  const inputProject = {
    id: mockProjectId,
    name: 'name',
    description: 'description',
    ownerId: 'ownerId',
    status: PROJECT_STATUS.ACTIVE,
    createdAt: new Date(),
  };

  const mockProject = Project.create(inputProject);

  describe('execute()', () => {
    it('should throw an error if the projectId is empty', async () => {
      const result = createTaskUseCase.execute({
        ...mockInput,
        projectId: '',
      });
      await expect(result).rejects.toThrow(new ValidationError('projectId is required'));
    });

    it('should throw an error if the title is empty', async () => {
      const result = createTaskUseCase.execute({
        ...mockInput,
        title: '',
      });
      await expect(result).rejects.toThrow(new ValidationError('title is required'));
    });

    it('should throw an error if the description is empty', async () => {
      const result = createTaskUseCase.execute({
        ...mockInput,
        description: '',
      });
      await expect(result).rejects.toThrow(new ValidationError('description is required'));
    });

    it('should throw an error when the project is not found', async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(null);
      const result = createTaskUseCase.execute(mockInput);
      await expect(result).rejects.toThrow(new NotFoundError('project not found'));
      expect(projectRepository.findById).toHaveBeenCalledWith(mockInput.projectId);
    });

    it('should throw an error when tasks cannot be added to the project', async () => {
      const mockProject = Project.create({
        ...inputProject,
        status: PROJECT_STATUS.ARCHIVED,
      });

      vi.mocked(projectRepository.findById).mockResolvedValue(mockProject);

      const result = createTaskUseCase.execute(mockInput);

      await expect(result).rejects.toThrow(
        new ConflictError('cannot add tasks to an archived project'),
      );
      expect(projectRepository.findById).toHaveBeenCalledWith(mockInput.projectId);
    });

    it('should return the created task', async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(mockProject);

      const result = await createTaskUseCase.execute(mockInput);

      expect(result).toBeInstanceOf(Task);
      expect(projectRepository.findById).toHaveBeenCalledWith(mockInput.projectId);
      expect(taskRepository.save).toHaveBeenCalledWith(result);
    });
  });
});
