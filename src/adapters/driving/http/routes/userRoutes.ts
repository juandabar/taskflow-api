import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController.js';

export async function userRoutes(
  fastify: FastifyInstance,
  controller: UserController,
): Promise<void> {
  fastify.post('/auth/register', controller.register.bind(controller));
}
