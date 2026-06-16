import { FastifyReply, FastifyRequest } from 'fastify';
import { IAddCommentUseCase } from '../../../../domain/ports/driving/IAddCommentUseCase.js';
import { IDeleteCommentUseCase } from '../../../../domain/ports/driving/IDeleteCommentUseCase.js';
import { CreateCommentSchema, DeleteCommentSchema } from '../schemas/comment.schema.js';

export class CommentController {
  constructor(
    private addCommentUseCase: IAddCommentUseCase,
    private deleteCommentUseCase: IDeleteCommentUseCase,
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = CreateCommentSchema.parse(request.body);
    const createdComment = await this.addCommentUseCase.execute({
      content: body.content,
      taskId: body.taskId,
      authorId: request.userId,
    });
    reply.status(201).send({
      id: createdComment.id,
      content: createdComment.content,
      taskId: createdComment.taskId,
      authorId: createdComment.authorId,
      createdAt: createdComment.createdAt,
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const params = DeleteCommentSchema.parse(request.params);
    await this.deleteCommentUseCase.execute(params.id, request.userId);
    reply.status(204).send();
  }
}
