import { randomUUID } from 'node:crypto';
import { Task } from '../../entities/Task.js';
import { ConflictError } from '../../errors/ConflictError.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { IProjectRepository } from '../../ports/driven/IProjectRepository.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { ICreateTaskInput, ICreateTaskUseCase } from '../../ports/driving/ICreateTaskUseCase.js';
import { TASK_STATUS } from '../../value-objects/TaskStatus.js';

export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private projectRepository: IProjectRepository,
  ) {}

  async execute(input: ICreateTaskInput): Promise<Task> {
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
      dueDate: input.dueDate ?? undefined,
    });

    await this.taskRepository.save(newTask);

    return newTask;
  }
}
