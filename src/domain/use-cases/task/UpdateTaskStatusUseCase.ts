import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import {
  IUpdateTaskStatusUseCase,
  UpdateTaskInput,
} from '../../ports/driving/IUpdateTaskStatusUseCase.js';

export class UpdateTaskStatusUseCase implements IUpdateTaskStatusUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: UpdateTaskInput): Promise<void> {
    if (!input.taskId) {
      throw new ValidationError('taskId is required');
    }

    if (!input.status) {
      throw new ValidationError('status is required');
    }

    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new NotFoundError('task not found');
    }

    task.updateStatus(input.status);

    await this.taskRepository.update(task);
  }
}
