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
    return new Comment(
      comment.id,
      comment.content,
      comment.taskId,
      comment.authorId,
      comment.createdAt,
    );
  }
}
