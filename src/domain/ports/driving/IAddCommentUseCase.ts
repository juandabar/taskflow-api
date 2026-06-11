import { Comment } from '../../entities/Comment.js';

export interface IAddCommentInput {
  content: string;
  taskId: string;
  authorId: string;
}

export interface IAddCommentUseCase {
  execute(input: IAddCommentInput): Promise<Comment>;
}
