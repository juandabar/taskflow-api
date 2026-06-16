import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Project } from '../../entities/Project.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { ICreateProjectUseCase } from '../../ports/driving/ICreateProjectUseCase.js';
import { CreateProjectUseCase } from './CreateProjectUseCase.js';

let createProjectUseCase: ICreateProjectUseCase;
let projectRepository: IProjectRepository;

describe('CreateProjectUseCase', () => {
  beforeEach(() => {
    projectRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    createProjectUseCase = new CreateProjectUseCase(projectRepository);
  });

  describe('execute()', () => {
    it('should throw an error if name is not provided', async () => {
      const result = createProjectUseCase.execute({
        name: '',
        description: 'description',
        ownerId: '123-abc',
      });

      await expect(result).rejects.toThrow(new ValidationError('name is required'));
    });

    it('should throw an error if description is not provided', async () => {
      const result = createProjectUseCase.execute({
        name: 'name',
        description: '',
        ownerId: '123-abc',
      });

      await expect(result).rejects.toThrow(new ValidationError('description is required'));
    });

    it('should throw an error if ownerId is not provided', async () => {
      const result = createProjectUseCase.execute({
        name: 'name',
        description: 'description',
        ownerId: '',
      });

      await expect(result).rejects.toThrow(new ValidationError('ownerId is required'));
    });

    it('should return the created project', async () => {
      const result = await createProjectUseCase.execute({
        name: 'name',
        description: 'description',
        ownerId: '123-abc',
      });

      expect(result).toBeInstanceOf(Project);
      expect(result.ownerId).toBe('123-abc');
    });
  });
});
