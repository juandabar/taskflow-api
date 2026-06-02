import { Task } from '../../entities/Task.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { Priority } from '../../value-objects/Priority.js';
import { TaskStatus } from '../../value-objects/TaskStatus.js';

interface IInputProps {
  projectId: string;
  filters?:
    | {
        status?: TaskStatus | undefined;
        priority?: Priority;
        assigneeId?: string;
      }
    | undefined;
}

export class ListTasksByProjectUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(input: IInputProps): Promise<Task[]> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }

    return await this.taskRepository.findByProjectId(input.projectId, input.filters);
  }
}
