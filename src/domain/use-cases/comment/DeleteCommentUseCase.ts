import { ForbiddenError } from '../../errors/ForbiddenError.js';
import { NotFoundError } from '../../errors/NotFoundError.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { ICommentRepository } from '../../ports/driven/ICommentRepository.js';
import { IUserRepository } from '../../ports/driven/IUserRepository.js';
import { USER_ROLE } from '../../value-objects/UserRole.js';

export class DeleteCommentUseCase {
  constructor(
    private commentRepository: ICommentRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute(commentId: string, userId: string): Promise<void> {
    if (!commentId) {
      throw new ValidationError('commentId is required');
    }

    if (!userId) {
      throw new ValidationError('userId is required');
    }

    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundError('comment not found');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('user not found');
    }

    const isAdmin = user.role === USER_ROLE.ADMIN;
    const isAuthor = comment.authorId === userId;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenError(
        `the comment can only be deleted by its owner or by an ${USER_ROLE.ADMIN}`,
      );
    }

    return await this.commentRepository.delete(commentId);
  }
}
