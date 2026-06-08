import Fastify from 'fastify';
import { errorHandler } from '../adapters/driving/http/errorHandler.js';
import { userRoutes } from '../adapters/driving/http/routes/userRoutes.js';
import { userController } from './container.js';

export const buildServer = async (): Promise<Fastify.FastifyInstance> => {
  const fastify = Fastify();

  fastify.setErrorHandler(errorHandler);

  await userRoutes(fastify, userController);

  return fastify;
};
