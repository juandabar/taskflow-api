import { TaskStatus } from '../../value-objects/TaskStatus.js';

export interface UpdateTaskInput {
  taskId: string;
  status: TaskStatus;
}

export interface IUpdateTaskStatusUseCase {
  execute(input: UpdateTaskInput): Promise<void>;
}
