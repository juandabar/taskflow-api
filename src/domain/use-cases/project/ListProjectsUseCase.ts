import { Project } from '../../entities/Project.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { IListProjectsUseCase } from '../../ports/driving/IListProjectsUseCase.js';
import { PROJECT_STATUS_VALUES, ProjectStatus } from '../../value-objects/ProjectStatus.js';

export class ListProjectsUseCase implements IListProjectsUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(status?: ProjectStatus): Promise<Project[]> {
    if (status && !PROJECT_STATUS_VALUES.includes(status)) {
      throw new ValidationError('status not allowed');
    }
    return await this.projectRepository.findAll(status);
  }
}
