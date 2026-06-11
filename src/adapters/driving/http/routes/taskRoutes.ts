import { FastifyInstance, preHandlerAsyncHookHandler } from 'fastify';
import { TaskController } from '../controllers/TaskController.js';

export async function taskRoutes(
  fastify: FastifyInstance,
  controller: TaskController,
  authGuard: preHandlerAsyncHookHandler,
): Promise<void> {
  fastify.post('/tasks', { preHandler: [authGuard] }, (req, reply) =>
    controller.create(req, reply),
  );
  fastify.get('/tasks', { preHandler: [authGuard] }, (req, reply) => controller.list(req, reply));
  fastify.get('/tasks/:id', { preHandler: [authGuard] }, (req, reply) =>
    controller.find(req, reply),
  );
  fastify.patch('/tasks/:id/assign', { preHandler: [authGuard] }, (req, reply) =>
    controller.assign(req, reply),
  );
  fastify.patch('/tasks/:id', { preHandler: [authGuard] }, (req, reply) =>
    controller.update(req, reply),
  );
}
