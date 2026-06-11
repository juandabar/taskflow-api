import { Task } from '../../entities/Task.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import {
  IListTasksByProjectUseCase,
  IListTasksInput,
} from '../../ports/driving/IListTasksByProjectUseCase.js';

export class ListTasksByProjectUseCase implements IListTasksByProjectUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: IListTasksInput): Promise<Task[]> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }

    return await this.taskRepository.findByProjectId(input.projectId, input.filters);
  }
}
