import { Task } from '../../entities/Task.js';
import { Priority } from '../../value-objects/Priority.js';

export interface ICreateTaskInput {
  title: string;
  description: string;
  projectId: string;
  priority: Priority;
  dueDate?: Date;
}

export interface ICreateTaskUseCase {
  execute(input: ICreateTaskInput): Promise<Task>;
}
