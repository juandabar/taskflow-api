import { Project } from '../../entities/Project.js';
import { IListProjectsUseCase } from '../../ports/driving/IListProjectsUseCase.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { ProjectStatus } from '../../value-objects/ProjectStatus.js';

export class ListProjectsUseCase implements IListProjectsUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(status?: ProjectStatus): Promise<Project[]> {
    return await this.projectRepository.findAll(status);
  }
}
