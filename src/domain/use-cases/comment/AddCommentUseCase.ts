import { randomUUID } from 'node:crypto';
import { Comment } from '../../entities/Comment.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ICommentRepository } from '../../ports/driven/ICommentRepository.js';
import { ITaskRepository } from '../../ports/driven/ITaskRepository.js';
import { IAddCommentInput, IAddCommentUseCase } from '../../ports/driving/IAddCommentUseCase.js';

export class AddCommentUseCase implements IAddCommentUseCase {
  constructor(
    private commentRepository: ICommentRepository,
    private taskRepository: ITaskRepository,
  ) {}

  async execute(input: IAddCommentInput): Promise<Comment> {
    if (!input.content) {
      throw new ValidationError('content is required');
    }

    if (!input.taskId) {
      throw new ValidationError('taskId is required');
    }

    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new NotFoundError('task not found');
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
