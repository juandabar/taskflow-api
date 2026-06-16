import Database from 'better-sqlite3';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Fastify from 'fastify';
import { buildServer } from '../../../../infrastructure/server.js';

export async function buildTestApp(): Promise<[Fastify.FastifyInstance, BetterSQLite3Database]> {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite);
  migrate(db, { migrationsFolder: './src/adapters/driven/persistence/drizzle/migrations' });
  return [await buildServer(db), db];
}
