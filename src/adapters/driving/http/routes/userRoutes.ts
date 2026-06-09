import { FastifyInstance, preHandlerAsyncHookHandler } from 'fastify';
import { UserController } from '../controllers/UserController.js';

export async function userRoutes(
  fastify: FastifyInstance,
  controller: UserController,
  authGuard: preHandlerAsyncHookHandler,
): Promise<void> {
  fastify.post('/auth/register', (req, reply) => controller.register(req, reply));
  fastify.post('/auth/login', (req, reply) => controller.login(req, reply));

  fastify.get('/user/list', { preHandler: [authGuard] }, (req, reply) =>
    controller.list(req, reply),
  );
  fastify.get('/user/:id', { preHandler: [authGuard] }, (req, reply) =>
    controller.getUserById(req, reply),
  );
}
