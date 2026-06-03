import { describe, it, expect } from 'vitest';
import { Comment } from './Comment.js';
import { randomUUID } from 'node:crypto';

describe('Comment', () => {
  const mockComment = {
    id: randomUUID(),
    content: 'content',
    taskId: 'taskId',
    authorId: 'authorId',
    createdAt: new Date(),
  };

  describe('create()', () => {
    it('it should throw an error when the id is empty', () => {
      expect(() => Comment.create({ ...mockComment, id: '' })).toThrow('id is required');
    });

    it('it should throw an error when the content is empty', () => {
      expect(() => Comment.create({ ...mockComment, content: '' })).toThrow('content is required');
    });

    it('it should throw an error when the taskId is empty', () => {
      expect(() => Comment.create({ ...mockComment, taskId: '' })).toThrow('taskId is required');
    });

    it('it should throw an error when the authorId is empty', () => {
      expect(() => Comment.create({ ...mockComment, authorId: '' })).toThrow(
        'authorId is required',
      );
    });

    it('it should return the created comment', () => {
      const mockNewComment = Comment.create(mockComment);
      expect(mockNewComment).toBeInstanceOf(Comment);
    });
  });
});
