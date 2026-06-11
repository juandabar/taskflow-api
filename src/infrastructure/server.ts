import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { errorHandler } from '../adapters/driving/http/errorHandler.js';

// routes
import { commentRoutes } from '../adapters/driving/http/routes/commentRoutes.js';
import { projectRoutes } from '../adapters/driving/http/routes/projectRoutes.js';
import { taskRoutes } from '../adapters/driving/http/routes/taskRoutes.js';
import { userRoutes } from '../adapters/driving/http/routes/userRoutes.js';

import {
  authGuard,
  commentController,
  projectController,
  taskController,
  userController,
} from './container.js';

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
  await taskRoutes(fastify, taskController, authGuard);
  await commentRoutes(fastify, commentController, authGuard);

  return fastify;
};
