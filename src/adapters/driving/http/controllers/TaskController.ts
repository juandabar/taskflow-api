import { FastifyReply, FastifyRequest } from 'fastify';
import { IAssignTaskUseCase } from '../../../../domain/ports/driving/IAssignTaskUseCase.js';
import { ICreateTaskUseCase } from '../../../../domain/ports/driving/ICreateTaskUseCase.js';
import { IGetTaskByIdUseCase } from '../../../../domain/ports/driving/IGetTaskByIdUseCase.js';
import { IListTasksByProjectUseCase } from '../../../../domain/ports/driving/IListTasksByProjectUseCase.js';
import { IUpdateTaskStatusUseCase } from '../../../../domain/ports/driving/IUpdateTaskStatusUseCase.js';
import {
  AssignTaskSchema,
  CreateTaskSchema,
  ListTaskSchema,
  TaskParamsSchema,
  UpdateTaskSchema,
} from '../schemas/task.schema.js';

export class TaskController {
  constructor(
    private createTaskUseCase: ICreateTaskUseCase,
    private listTasksByProjectUseCase: IListTasksByProjectUseCase,
    private getTaskByIdUseCase: IGetTaskByIdUseCase,
    private assignTaskUseCase: IAssignTaskUseCase,
    private updateTaskStatusUseCase: IUpdateTaskStatusUseCase,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = CreateTaskSchema.parse(request.body);
    const createdTask = await this.createTaskUseCase.execute(body);
    reply.send({
      id: createdTask.id,
      title: createdTask.title,
      description: createdTask.description,
      projectId: createdTask.projectId,
      status: createdTask.status,
      priority: createdTask.priority,
      createdAt: createdTask.createdAt,
      dueDate: createdTask.dueDate,
    });
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const raw = request.query as Record<string, string>;
    const query = ListTaskSchema.parse(raw);
    const foundTasks = await this.listTasksByProjectUseCase.execute({
      projectId: query.projectId,
      filters: {
        status: query.status,
        priority: query.priority,
        assigneeId: query.assigneeId,
      },
    });

    reply.send(
      foundTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        projectId: t.projectId,
        assigneeId: t.assigneeId,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
      })),
    );
  }

  async find(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = TaskParamsSchema.parse(request.params);
    const foundTask = await this.getTaskByIdUseCase.execute(params.id);
    reply.send({
      id: foundTask.id,
      title: foundTask.title,
      description: foundTask.description,
      projectId: foundTask.projectId,
      assigneeId: foundTask.assigneeId,
      status: foundTask.status,
      priority: foundTask.priority,
      dueDate: foundTask.dueDate,
      createdAt: foundTask.createdAt,
    });
  }

  async assign(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = TaskParamsSchema.parse(request.params);
    const body = AssignTaskSchema.parse(request.body);
    await this.assignTaskUseCase.execute(params.id, body.userId);
    reply.send({
      detail: 'task assigned correctly',
    });
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = TaskParamsSchema.parse(request.params);
    const body = UpdateTaskSchema.parse(request.body);
    await this.updateTaskStatusUseCase.execute({
      taskId: params.id,
      status: body.status,
    });
    reply.send({ detail: 'status updated correctly' });
  }
}
