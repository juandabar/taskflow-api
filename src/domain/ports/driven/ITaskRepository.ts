import { Task } from '../../entities/Task.js';
import { Priority } from '../../value-objects/Priority.js';
import { TaskStatus } from '../../value-objects/TaskStatus.js';

export interface ITaskRepository {
  findByProjectId(
    projectId: string,
    filters?: {
      status?: TaskStatus;
      priority?: Priority;
      assigneeId?: string;
    },
  ): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  update(task: Task): Promise<void>;
  save(task: Task): Promise<void>;
}
