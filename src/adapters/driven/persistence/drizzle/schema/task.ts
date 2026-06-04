import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './user.js';
import { projects } from './project.js';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  projectId: text('projectId')
    .notNull()
    .references(() => projects.id),
  assigneeId: text('assigneeId').references(() => users.id),
  status: text('status').notNull(),
  priority: text('priority').notNull(),
  dueDate: integer('dueDate', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
});
