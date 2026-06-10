import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { errorHandler } from '../adapters/driving/http/errorHandler.js';

// routes
import { userRoutes } from '../adapters/driving/http/routes/userRoutes.js';
import { projectRoutes } from '../adapters/driving/http/routes/projectRoutes.js';

import { userController, projectController, authGuard } from './container.js';

import { generateOpenApiDocument } from './openapi.js';

export const buildServer = async (): Promise<Fastify.FastifyInstance> => {
  const fastify = Fastify();

  await fastify.register(swagger, {
    mode: 'static',
    specification: {
      document: generateOpenApiDocument(),
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
  });

  fastify.setErrorHandler(errorHandler);

  await userRoutes(fastify, userController, authGuard);
  await projectRoutes(fastify, projectController, authGuard);

  return fastify;
};
