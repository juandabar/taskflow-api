import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './user.js';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  ownerId: text('ownerId')
    .notNull()
    .references(() => users.id),
  status: text('status').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
});
