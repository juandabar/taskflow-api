import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { tasks } from './task.js';
import { users } from './user.js';

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().notNull(),
  content: text('content').notNull(),
  taskId: text('taskId')
    .notNull()
    .references(() => tasks.id),
  authorId: text('authorId')
    .notNull()
    .references(() => users.id),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
});
