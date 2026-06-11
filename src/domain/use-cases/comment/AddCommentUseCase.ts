import { randomUUID } from 'node:crypto';
import { Comment } from '../../entities/Comment.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ICommentRepository } from '../../ports/driven/ICommentRepository.js';
import { IAddCommentInput, IAddCommentUseCase } from '../../ports/driving/IAddCommentUseCase.js';

export class AddCommentUseCase implements IAddCommentUseCase {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(input: IAddCommentInput): Promise<Comment> {
    if (!input.content) {
      throw new ValidationError('content is required');
    }

    if (!input.taskId) {
      throw new ValidationError('taskId is required');
    }

    if (!input.authorId) {
      throw new ValidationError('authorId is required');
    }

    const newComment = Comment.create({
      id: randomUUID(),
      content: input.content,
      taskId: input.taskId,
      authorId: input.authorId,
      createdAt: new Date(),
    });

    await this.commentRepository.save(newComment);

    return newComment;
  }
}
