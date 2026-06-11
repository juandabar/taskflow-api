import { ForbiddenError } from '../../errors/ForbiddenError.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IArchiveProjectUseCase } from '../../ports/driving/IArchiveProjectUseCase.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';

export class ArchiveProjectUseCase implements IArchiveProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(userId: string, projectId: string): Promise<void> {
    if (!userId) {
      throw new ValidationError('userId is required');
    }
    if (!projectId) {
      throw new ValidationError('projectId is required');
    }

    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundError('project not found');
    }

    if (userId !== project.ownerId) {
      throw new ForbiddenError("userId does not match the project owner's id");
    }

    project.archive();

    await this.projectRepository.update(project);
  }
}
