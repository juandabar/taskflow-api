import { Task } from '../../entities/Task.js';

export interface IGetTaskByIdUseCase {
  execute(id: string): Promise<Task>;
}
