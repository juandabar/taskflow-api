import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Project } from '../../entities/Project.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { IListProjectsUseCase } from '../../ports/driving/IListProjectsUseCase.js';
import { PROJECT_STATUS, ProjectStatus } from '../../value-objects/ProjectStatus.js';
import { ListProjectsUseCase } from './ListProjectsUseCase.js';

let listProjectsUseCase: IListProjectsUseCase;
let projectRepository: IProjectRepository;

const mockProject = {
  id: '1234-abcd-project',
  name: 'name',
  description: 'description',
  ownerId: '1234-abcd-user',
  status: PROJECT_STATUS.ACTIVE,
  createdAt: new Date(),
};

describe('ListProjectsUseCase', () => {
  beforeEach(() => {
    projectRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    listProjectsUseCase = new ListProjectsUseCase(projectRepository);
  });

  describe('execute()', () => {
    it('should throw an error if the status to filter is incorrect', async () => {
      const result = listProjectsUseCase.execute('activo' as ProjectStatus);
      await expect(result).rejects.toThrow(new ValidationError('status not allowed'));
    });

    it('should return the filtered projects', async () => {
      const project = Project.create(mockProject);
      vi.mocked(projectRepository.findAll).mockResolvedValue([project]);

      const result = await listProjectsUseCase.execute(PROJECT_STATUS.ACTIVE);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeInstanceOf(Project);
    });

    it('should return all registered projects', async () => {
      const project = Project.create(mockProject);
      vi.mocked(projectRepository.findAll).mockResolvedValue([project]);

      const result = await listProjectsUseCase.execute();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeInstanceOf(Project);
    });
  });
});
