import { Project } from '../../entities/Project.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';

export class GetProjectByIdUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Project> {
    if (!id) {
      throw new ValidationError('id is required');
    }

    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundError('project not found');
    }

    return project;
  }
}
