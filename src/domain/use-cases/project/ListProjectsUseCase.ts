import { Project } from '../../entities/Project.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { ProjectStatus } from '../../value-objects/ProjectStatus.js';

export class ListProjectsUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(status?: ProjectStatus): Promise<Project[]> {
    return await this.projectRepository.findAll(status);
  }
}
