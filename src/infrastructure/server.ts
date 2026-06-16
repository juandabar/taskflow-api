import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { errorHandler } from '../adapters/driving/http/errorHandler.js';

// routes
import { commentRoutes } from '../adapters/driving/http/routes/commentRoutes.js';
import { projectRoutes } from '../adapters/driving/http/routes/projectRoutes.js';
import { taskRoutes } from '../adapters/driving/http/routes/taskRoutes.js';
import { userRoutes } from '../adapters/driving/http/routes/userRoutes.js';

import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { createContainer } from './container.js';
import { generateOpenApiDocument } from './openapi.js';

export const buildServer = async (db: BetterSQLite3Database): Promise<Fastify.FastifyInstance> => {
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

  const { authGuard, commentController, projectController, taskController, userController } =
    createContainer(db);

  await userRoutes(fastify, userController, authGuard);
  await projectRoutes(fastify, projectController, authGuard);
  await taskRoutes(fastify, taskController, authGuard);
  await commentRoutes(fastify, commentController, authGuard);

  return fastify;
};
