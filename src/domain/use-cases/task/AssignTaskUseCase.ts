import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { IAssignTaskUseCase } from '../../ports/driving/IAssignTaskUseCase.js';

export class AssignTaskUseCase implements IAssignTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, userId: string): Promise<void> {
    if (!taskId) {
      throw new ValidationError('taskId is required');
    }

    if (!userId) {
      throw new ValidationError('userId is required');
    }

    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('task not found');
    }

    task.assign(userId);

    await this.taskRepository.update(task);
  }
}
