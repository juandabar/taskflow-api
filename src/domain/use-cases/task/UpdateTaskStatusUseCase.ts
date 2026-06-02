import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { TaskStatus } from '../../value-objects/TaskStatus.js';

interface IInputProps {
  taskId: string;
  status: TaskStatus;
}

export class UpdateTaskStatusUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: IInputProps): Promise<void> {
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
