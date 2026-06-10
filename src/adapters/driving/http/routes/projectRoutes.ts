import { FastifyInstance, preHandlerAsyncHookHandler } from 'fastify';
import { ProjectController } from '../controllers/ProjectController.js';

export async function projectRoutes(
  fastify: FastifyInstance,
  controller: ProjectController,
  authGuard: preHandlerAsyncHookHandler,
): Promise<void> {
  fastify.post('/projects', { preHandler: [authGuard] }, (req, reply) =>
    controller.create(req, reply),
  );
  fastify.get('/projects', { preHandler: [authGuard] }, (req, reply) =>
    controller.list(req, reply),
  );
  fastify.get('/projects/:id', { preHandler: [authGuard] }, (req, reply) =>
    controller.find(req, reply),
  );
  fastify.patch('/projects/:id/archive', { preHandler: [authGuard] }, (req, reply) =>
    controller.file(req, reply),
  );
}
