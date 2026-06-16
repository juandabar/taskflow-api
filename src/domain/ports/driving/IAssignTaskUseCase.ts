import { Task } from '../../entities/Task.js';

export interface IAssignTaskUseCase {
  execute(taskId: string, userId: string): Promise<Task>;
}
