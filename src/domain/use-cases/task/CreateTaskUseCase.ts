import { Task } from '../../entities/Task.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { Priority } from '../../value-objects/Priority.js';
import { TASK_STATUS } from '../../value-objects/TaskStatus.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { randomUUID } from 'node:crypto';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ConflictError } from '../../errors/ConflictError.js';

interface IInputProps {
  title: string;
  description: string;
  projectId: string;
  priority: Priority;
}

export class CreateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private projectRepository: IProjectRepository,
  ) {}

  async execute(input: IInputProps): Promise<Task> {
    if (!input.projectId) {
      throw new ValidationError('projectId is required');
    }

    if (!input.title) {
      throw new ValidationError('title is required');
    }

    if (!input.description) {
      throw new ValidationError('description is required');
    }

    if (!input.priority) {
      throw new ValidationError('priority is required');
    }

    const project = await this.projectRepository.findById(input.projectId);

    if (!project) {
      throw new NotFoundError('project not found');
    }

    if (!project.canAddTasks()) {
      throw new ConflictError('cannot add tasks to an archived project');
    }

    const newTask = Task.create({
      id: randomUUID(),
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      status: TASK_STATUS.TODO,
      priority: input.priority,
      createdAt: new Date(),
    });

    await this.taskRepository.save(newTask);

    return newTask;
  }
}
