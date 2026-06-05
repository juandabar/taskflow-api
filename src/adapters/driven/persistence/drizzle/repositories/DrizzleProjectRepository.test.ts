import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { beforeEach, describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { IProjectRepository } from '../../../../../domain/ports/driven/IProjectRepository.js';
import { DrizzleProjectRepository } from './DrizzleProjectRepository.js';
import { Project } from '../../../../../domain/entities/Project.js';
import { PROJECT_STATUS } from '../../../../../domain/value-objects/ProjectStatus.js';
import { USER_ROLE } from '../../../../../domain/value-objects/UserRole.js';
import { IUserRepository } from '../../../../../domain/ports/driven/IUserRepository.js';
import { DrizzleUserRepository } from './DrizzleUserRepository.js';
import { User } from '../../../../../domain/entities/User.js';

let sqlite: InstanceType<typeof Database>;
let db: BetterSQLite3Database;

let drizzleUserRepository: IUserRepository;
let drizzleProjectRepository: IProjectRepository;

const mockUserId = randomUUID();
const mockProjectId = randomUUID();

const inputUser = {
  id: mockUserId,
  name: 'Juan',
  email: 'juan@gmail.com',
  passwordHash: 'hash123',
  role: USER_ROLE.MEMBER,
  createdAt: new Date(),
};

const inputProject = {
  id: mockProjectId,
  name: 'Project A',
  description: 'this is the Project A',
  ownerId: mockUserId,
  status: PROJECT_STATUS.ACTIVE,
  createdAt: new Date(),
};

describe('DrizzleProjectRepository', () => {
  beforeEach(async () => {
    sqlite = new Database(':memory:');
    db = drizzle(sqlite);
    migrate(db, { migrationsFolder: './src/adapters/driven/persistence/drizzle/migrations' });

    drizzleUserRepository = new DrizzleUserRepository(db);
    drizzleProjectRepository = new DrizzleProjectRepository(db);

    await drizzleUserRepository.save(User.create(inputUser));
    await drizzleProjectRepository.save(Project.create(inputProject));
  });

  it('findAll() should return an empty array if there are no projects', async () => {
    const result = await drizzleProjectRepository.findAll(PROJECT_STATUS.ARCHIVED);

    expect(result.length).toBe(0);
  });

  it('should return an array with the projects in the database', async () => {
    const result = await drizzleProjectRepository.findAll();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toBeInstanceOf(Project);
  });

  it('findAll() should return an array with the projects filtered by status', async () => {
    const result = await drizzleProjectRepository.findAll(PROJECT_STATUS.ACTIVE);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toBeInstanceOf(Project);
  });

  it('findById() should return null if the project was not found by id', async () => {
    const result = await drizzleProjectRepository.findById('123-abc');

    expect(result).toBeNull();
  });

  it('findById() should return the project if it was found', async () => {
    const result = await drizzleProjectRepository.findById(mockProjectId);

    expect(result).toBeInstanceOf(Project);
    expect(result!.id).toBe(mockProjectId);
  });

  it('update() should update the project correctly', async () => {
    const result = await drizzleProjectRepository.findById(mockProjectId);
    expect(result).toBeInstanceOf(Project);
    expect(result!.status).toBe(PROJECT_STATUS.ACTIVE);
    result!.archive();
    await drizzleProjectRepository.update(result!);
    const updatedProject = await drizzleProjectRepository.findById(mockProjectId);
    expect(updatedProject!.status).toBe(PROJECT_STATUS.ARCHIVED);
  });

  it('save() should throw an error if trying to insert a project with an id that is already registered', async () => {
    await expect(() =>
      drizzleProjectRepository.save(Project.create(inputProject)),
    ).rejects.toThrow();
  });
});
