import { FastifyInstance, preHandlerAsyncHookHandler } from 'fastify';
import { CommentController } from '../controllers/CommentController.js';

export async function commentRoutes(
  fastify: FastifyInstance,
  controller: CommentController,
  authGuard: preHandlerAsyncHookHandler,
): Promise<void> {
  fastify.post('/comments', { preHandler: [authGuard] }, (req, reply) =>
    controller.create(req, reply),
  );
}
