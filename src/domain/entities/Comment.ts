import { ValidationError } from '../errors/ValidationError.js';

interface ICommentProps {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
}

export class Comment {
  private constructor(
    private _id: string,
    private _content: string,
    private _taskId: string,
    private _authorId: string,
    private _createdAt: Date,
  ) {}

  get id(): string {
    return this._id;
  }

  get content(): string {
    return this._content;
  }

  get taskId(): string {
    return this._taskId;
  }

  get authorId(): string {
    return this._authorId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  static create(comment: ICommentProps): Comment {
    if (!comment.id) {
      throw new ValidationError('id is required');
    }

    if (!comment.content) {
      throw new ValidationError('content is required');
    }

    if (!comment.taskId) {
      throw new ValidationError('taskId is required');
    }

    if (!comment.authorId) {
      throw new ValidationError('authorId is required');
    }

    return new Comment(
      comment.id,
      comment.content,
      comment.taskId,
      comment.authorId,
      comment.createdAt,
    );
  }
}
