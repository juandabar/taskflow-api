import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Project } from '../../entities/Project.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { IGetProjectByIdUseCase } from '../../ports/driving/IGetProjectByIdUseCase.js';
import { PROJECT_STATUS } from '../../value-objects/ProjectStatus.js';
import { GetProjectByIdUseCase } from './GetProjectByIdUseCase.js';

let getProjectByIdUseCase: IGetProjectByIdUseCase;
let projectRepository: IProjectRepository;

const mockProject = {
  id: '1234-abcd-project',
  name: 'name',
  description: 'description',
  ownerId: '1234-abcd-user',
  status: PROJECT_STATUS.ACTIVE,
  createdAt: new Date(),
};

describe('GetProjectByIdUseCase', () => {
  beforeEach(() => {
    projectRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    getProjectByIdUseCase = new GetProjectByIdUseCase(projectRepository);
  });

  describe('execute', () => {
    it('should throw an error if name is not provided', async () => {
      const result = getProjectByIdUseCase.execute('');
      await expect(result).rejects.toThrow(new ValidationError('id is required'));
    });

    it('should throw an error if the project was not found', async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(null);

      const result = getProjectByIdUseCase.execute('123-abc');
      await expect(result).rejects.toThrow(new NotFoundError('project not found'));
    });

    it('should return the found project', async () => {
      const project = Project.create(mockProject);
      vi.mocked(projectRepository.findById).mockResolvedValue(project);

      const result = await getProjectByIdUseCase.execute(mockProject.id);
      expect(result).toBeInstanceOf(Project);
      expect(result.id).toBe(mockProject.id);
    });
  });
});
