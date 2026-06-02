import { Task } from '../../entities/Task.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';

export class GetTaskByIdUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Task> {
    if (!id) {
      throw new ValidationError('id is required');
    }

    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError('task not found');
    }

    return task;
  }
}
