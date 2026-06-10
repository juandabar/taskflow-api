import { FastifyRequest, FastifyReply } from 'fastify';
import {
  CreateProjectSchema,
  FileProjectSchema,
  PathProjectSchema,
  QueryProjectSchema,
} from '../schemas/project.schema.js';
import { ICreateProjectUseCase } from '../../../../domain/ports/driven/ICreateProjectUseCase.js';
import { IListProjectsUseCase } from '../../../../domain/ports/driven/IListProjectsUseCase.js';
import { IGetProjectByIdUseCase } from '../../../../domain/ports/driven/IGetProjectByIdUseCase.js';
import { IArchiveProjectUseCase } from '../../../../domain/ports/driven/IArchiveProjectUseCase.js';

export class ProjectController {
  constructor(
    private createProjectUseCase: ICreateProjectUseCase,
    private listProjectsUseCase: IListProjectsUseCase,
    private getProjectByIdUseCase: IGetProjectByIdUseCase,
    private achiveProjectUseCase: IArchiveProjectUseCase,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = CreateProjectSchema.parse(request.body);

    const data = {
      name: body.name,
      description: body.description,
      ownerId: request.userId,
    };

    const createdProject = await this.createProjectUseCase.execute(data);

    reply.send({
      id: createdProject.id,
      name: createdProject.name,
      description: createdProject.description,
      ownerId: createdProject.ownerId,
      status: createdProject.status,
      createdAt: createdProject.createdAt,
    });
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const raw = request.query as Record<string, string>;
    const query = QueryProjectSchema.parse({
      status: raw.status || undefined,
    });

    const projects = await this.listProjectsUseCase.execute(query.status);
    reply.send(
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        ownerId: p.ownerId,
        status: p.status,
        createdAt: p.createdAt,
      })),
    );
  }

  async find(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = PathProjectSchema.parse(request.params);

    const foundProject = await this.getProjectByIdUseCase.execute(params.id);

    reply.send({
      id: foundProject.id,
      name: foundProject.name,
      ownerId: foundProject.ownerId,
      status: foundProject.status,
      createdAt: foundProject.createdAt,
    });
  }

  async file(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = FileProjectSchema.parse(request.params);

    await this.achiveProjectUseCase.execute(request.userId, params.id);

    reply.send({ detail: 'project archived successfully' });
  }
}
