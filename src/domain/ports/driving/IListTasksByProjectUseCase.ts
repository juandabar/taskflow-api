import { Task } from '../../entities/Task.js';
import { Priority } from '../../value-objects/Priority.js';
import { TaskStatus } from '../../value-objects/TaskStatus.js';

export interface IListTasksInput {
  projectId: string;
  filters?:
    | {
        status?: TaskStatus | undefined;
        priority?: Priority;
        assigneeId?: string;
      }
    | undefined;
}

export interface IListTasksByProjectUseCase {
  execute(input: IListTasksInput): Promise<Task[]>;
}
