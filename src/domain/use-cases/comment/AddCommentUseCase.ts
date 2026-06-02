import { Comment } from '../../entities/Comment.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ICommentRepository } from '../../ports/driven/ICommentRepository.js';
import { randomUUID } from 'node:crypto';

interface IInputProps {
  content: string;
  taskId: string;
  authorId: string;
}

export class AddCommentUseCase {
  constructor(private commentRepository: ICommentRepository) {}

  async execute(input: IInputProps): Promise<Comment> {
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
