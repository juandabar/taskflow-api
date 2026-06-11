import { FastifyReply, FastifyRequest } from 'fastify';
import { IAddCommentUseCase } from '../../../../domain/ports/driving/IAddCommentUseCase.js';
import { CreateCommentSchema } from '../schemas/comment.schema.js';

export class CommentController {
  constructor(private addCommentUseCase: IAddCommentUseCase) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = CreateCommentSchema.parse(request.body);
    const createdComment = await this.addCommentUseCase.execute(body);
    reply.send({
      id: createdComment.id,
      content: createdComment.content,
      taskId: createdComment.taskId,
      authorId: createdComment.authorId,
      createdAt: createdComment.createdAt,
    });
  }
}
