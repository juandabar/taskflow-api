import { Task } from '../../entities/Task.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { IGetTaskByIdUseCase } from '../../ports/driving/IGetTaskByIdUseCase.js';

export class GetTaskByIdUseCase implements IGetTaskByIdUseCase {
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
