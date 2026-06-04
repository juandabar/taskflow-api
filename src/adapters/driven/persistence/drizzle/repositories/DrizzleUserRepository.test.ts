import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { beforeEach, describe, it, expect } from 'vitest';
import { IUserRepository } from '../../../../../domain/ports/driven/IUserRepository.js';
import { DrizzleUserRepository } from './DrizzleUserRepository.js';
import { User } from '../../../../../domain/entities/User.js';
import { randomUUID } from 'node:crypto';
import { USER_ROLE } from '../../../../../domain/value-objects/UserRole.js';

let sqlite: InstanceType<typeof Database>;
let db: BetterSQLite3Database;
let drizzleUserRepository: IUserRepository;

describe('DrizzleUserRepository', () => {
  beforeEach(() => {
    sqlite = new Database(':memory:');
    db = drizzle(sqlite);
    migrate(db, { migrationsFolder: './src/adapters/driven/persistence/drizzle/migrations' });
    drizzleUserRepository = new DrizzleUserRepository(db);
  });

  it('findAll() should return all users', async () => {
    const user = User.create({
      id: randomUUID(),
      name: 'Juan',
      email: 'juan@gmail.com',
      passwordHash: 'hash123',
      role: USER_ROLE.MEMBER,
      createdAt: new Date(),
    });

    await drizzleUserRepository.save(user);
    const result = await drizzleUserRepository.findAll();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toBeInstanceOf(User);
  });

  it('findById() should return the user filtered by id', async () => {
    const user = User.create({
      id: randomUUID(),
      name: 'Juan',
      email: 'juan@gmail.com',
      passwordHash: 'hash123',
      role: USER_ROLE.MEMBER,
      createdAt: new Date(),
    });

    await drizzleUserRepository.save(user);

    const result = await drizzleUserRepository.findById(user.id);

    expect(result).toBeInstanceOf(User);
    expect(result?.id).toBe(user.id);
  });

  it('findByEmail() should return the user filtered by email', async () => {
    const user = User.create({
      id: randomUUID(),
      name: 'Juan',
      email: 'juan@gmail.com',
      passwordHash: 'hash123',
      role: USER_ROLE.MEMBER,
      createdAt: new Date(),
    });

    await drizzleUserRepository.save(user);

    const result = await drizzleUserRepository.findByEmail(user.email);

    expect(result).toBeInstanceOf(User);
    expect(result?.email).toBe(user.email);
  });

  it('should throw an error when trying to create a user with an email that is already registered', async () => {
    const user1 = User.create({
      id: randomUUID(),
      name: 'Juan',
      email: 'juan@gmail.com',
      passwordHash: 'hash123',
      role: USER_ROLE.MEMBER,
      createdAt: new Date(),
    });
    const user2 = User.create({
      id: randomUUID(),
      name: 'Juan',
      email: 'juan@gmail.com',
      passwordHash: 'hash123',
      role: USER_ROLE.MEMBER,
      createdAt: new Date(),
    });

    await drizzleUserRepository.save(user1);

    await expect(drizzleUserRepository.save(user2)).rejects.toThrow();
  });
});
