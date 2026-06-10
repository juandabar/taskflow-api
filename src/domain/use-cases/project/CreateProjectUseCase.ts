import { Project } from '../../entities/Project.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { randomUUID } from 'node:crypto';
import { PROJECT_STATUS } from '../../value-objects/ProjectStatus.js';
import {
  ICreateProjectInput,
  ICreateProjectUseCase,
} from '../../ports/driven/ICreateProjectUseCase.js';

export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(input: ICreateProjectInput): Promise<Project> {
    if (!input.name) {
      throw new ValidationError('name is required');
    }

    if (!input.description) {
      throw new ValidationError('description is required');
    }

    if (!input.ownerId) {
      throw new ValidationError('ownerId is required');
    }

    const newProject = Project.create({
      id: randomUUID(),
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
      status: PROJECT_STATUS.ACTIVE,
      createdAt: new Date(),
    });

    await this.projectRepository.save(newProject);

    return newProject;
  }
}
