import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/UserController.js';

export async function userRoutes(fastify: FastifyInstance, controller: UserController) {
  fastify.post('/auth/register', controller.register.bind(controller));
}
