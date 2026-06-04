import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { ICommentRepository } from '../../../../../domain/ports/driven/ICommentRepository.js';
import { Comment } from '../../../../../domain/entities/Comment.js';
import { comments } from '../schema/comment.js';
import { eq } from 'drizzle-orm';

interface IPlainComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
}

export class DrizzleCommentRepository implements ICommentRepository {
  constructor(private db: BetterSQLite3Database) {}

  private formatToComment(comment: IPlainComment): Comment {
    return Comment.create({
      id: comment.id,
      content: comment.content,
      taskId: comment.taskId,
      authorId: comment.authorId,
      createdAt: comment.createdAt,
    });
  }

  async findById(id: string): Promise<Comment | null> {
    const result = this.db.select().from(comments).where(eq(comments.id, id)).get();

    if (!result) {
      return null;
    }

    return this.formatToComment(result);
  }

  async save(comment: Comment): Promise<void> {
    this.db
      .insert(comments)
      .values({
        id: comment.id,
        content: comment.content,
        taskId: comment.taskId,
        authorId: comment.authorId,
        createdAt: comment.createdAt,
      })
      .run();
  }

  async delete(id: string): Promise<void> {
    this.db.delete(comments).where(eq(comments.id, id)).run();
  }
}
