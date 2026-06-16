import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Project } from '../../entities/Project.js';
import { ForbiddenError } from '../../errors/ForbiddenError.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { IArchiveProjectUseCase } from '../../ports/driving/IArchiveProjectUseCase.js';
import { PROJECT_STATUS } from '../../value-objects/ProjectStatus.js';
import { ArchiveProjectUseCase } from './ArchiveProjectUseCase.js';

let archiveProjectUseCase: IArchiveProjectUseCase;
let projectRepository: IProjectRepository;

const mockProject = {
  id: '1234-abcd-project',
  name: 'name',
  description: 'description',
  ownerId: '1234-abcd-user',
  status: PROJECT_STATUS.ACTIVE,
  createdAt: new Date(),
};

describe('ArchiveProjectUseCase', () => {
  beforeEach(() => {
    projectRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    archiveProjectUseCase = new ArchiveProjectUseCase(projectRepository);
  });

  describe('execute()', () => {
    it('should throw an error if userId is not provided', async () => {
      const result = archiveProjectUseCase.execute('', '1234-abcd');
      await expect(result).rejects.toThrow(new ValidationError('userId is required'));
    });

    it('should throw an error if projectId is not provided', async () => {
      const result = archiveProjectUseCase.execute('1234-abcd', '');
      await expect(result).rejects.toThrow(new ValidationError('projectId is required'));
    });

    it('should throw an error when the project was not found', async () => {
      vi.mocked(projectRepository.findById).mockResolvedValue(null);
      const result = archiveProjectUseCase.execute('1234-abcd', '1234-abcd');
      await expect(result).rejects.toThrow(new NotFoundError('project not found'));
    });

    it('should throw an error when trying to archive a project that does not belong to the user', async () => {
      const newProject = Project.create(mockProject);
      vi.mocked(projectRepository.findById).mockResolvedValue(newProject);

      const result = archiveProjectUseCase.execute('1234-abcd', '1234-abcd-project');
      await expect(result).rejects.toThrow(
        new ForbiddenError("userId does not match the project owner's id"),
      );
    });

    it('should archive the project correctly', async () => {
      const newProject = Project.create(mockProject);
      vi.mocked(projectRepository.findById).mockResolvedValue(newProject);

      await archiveProjectUseCase.execute('1234-abcd-user', '1234-abcd-project');
      expect(newProject.status).toBe(PROJECT_STATUS.ARCHIVED);
      expect(projectRepository.update).toHaveBeenCalled();
    });
  });
});
