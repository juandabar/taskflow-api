import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { errorHandler } from '../adapters/driving/http/errorHandler.js';
import { userRoutes } from '../adapters/driving/http/routes/userRoutes.js';
import { userController, authGuard } from './container.js';

export const buildServer = async (): Promise<Fastify.FastifyInstance> => {
  const fastify = Fastify();

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'TaskFlow API',
        description: 'Task management API',
        version: '1.0.0',
      },
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
  });

  fastify.setErrorHandler(errorHandler);

  await userRoutes(fastify, userController, authGuard);

  return fastify;
};
