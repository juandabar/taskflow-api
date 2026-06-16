import { Task } from '../../entities/Task.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import {
  IListTasksByProjectUseCase,
  IListTasksInput,
} from '../../ports/driving/IListTasksByProjectUseCase.js';

export class ListTasksByProjectUseCase implements IListTasksByProjectUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private projectRepository: IProjectRepository,
  ) {}

  async execute(input: IListTasksInput): Promise<Task[]> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }

    const project = await this.projectRepository.findById(input.projectId);

    if (project === null) {
      throw new NotFoundError('Project not found');
    }

    return await this.taskRepository.findByProjectId(input.projectId, input.filters);
  }
}
