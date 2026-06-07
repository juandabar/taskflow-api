import { env } from './infrastructure/config/env.js';
import { logger } from './infrastructure/logger.js';
import { buildServer } from './infrastructure/server.js';

const main = async () => {
  const server = await buildServer();

  await server.listen({
    port: env.PORT,
    host: '0.0.0.0',
  });

  logger.info({ port: env.PORT }, 'Server started');
};

main().catch((error) => {
  logger.error(error, 'Failed to start server');
  process.exit(1);
});
