import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { beforeEach, describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { DrizzleTaskRepository } from './DrizzleTaskRepository.js';
import { ITaskRepository } from '../../../../../domain/ports/driven/ITaskRepository.js';
import { TASK_STATUS } from '../../../../../domain/value-objects/TaskStatus.js';
import { PRIORITY } from '../../../../../domain/value-objects/Priority.js';
import { Task } from '../../../../../domain/entities/Task.js';
import { USER_ROLE } from '../../../../../domain/value-objects/UserRole.js';
import { DrizzleUserRepository } from './DrizzleUserRepository.js';
import { IUserRepository } from '../../../../../domain/ports/driven/IUserRepository.js';
import { IProjectRepository } from '../../../../../domain/ports/driven/IProjectRepository.js';
import { DrizzleProjectRepository } from './DrizzleProjectRepository.js';
import { User } from '../../../../../domain/entities/User.js';
import { Project } from '../../../../../domain/entities/Project.js';
import { PROJECT_STATUS } from '../../../../../domain/value-objects/ProjectStatus.js';

let sqlite: InstanceType<typeof Database>;
let db: BetterSQLite3Database;
let drizzleUserRepository: IUserRepository;
let drizzleTaskRepository: ITaskRepository;
let drizzleProjectRepository: IProjectRepository;

const mockTasktId = randomUUID();
const mockProjectId = randomUUID();
const mockUserId = randomUUID();
const mockDueDate = new Date();
mockDueDate.setMinutes(mockDueDate.getMinutes() + 5);

const inputTask = {
  id: mockTasktId,
  title: 'Task A',
  description: 'this is the Task A',
  projectId: mockProjectId,
  assigneeId: mockUserId,
  status: TASK_STATUS.TODO,
  priority: PRIORITY.HIGH,
  dueDate: mockDueDate,
  createdAt: new Date(),
};

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

describe('DrizzleTaskRepository', () => {
  beforeEach(async () => {
    sqlite = new Database(':memory:');
    db = drizzle(sqlite);
    migrate(db, { migrationsFolder: './src/adapters/driven/persistence/drizzle/migrations' });

    drizzleUserRepository = new DrizzleUserRepository(db);
    drizzleProjectRepository = new DrizzleProjectRepository(db);
    drizzleTaskRepository = new DrizzleTaskRepository(db);

    await drizzleUserRepository.save(User.create(inputUser));
    await drizzleProjectRepository.save(Project.create(inputProject));
    await drizzleTaskRepository.save(Task.create(inputTask));
  });

  it('findByProjectId() should return an empty array if no tasks were filtered', async () => {
    const filter = {
      status: TASK_STATUS.DONE,
    };

    const result = await drizzleTaskRepository.findByProjectId(mockProjectId, filter);

    expect(result.length).toBe(0);
  });

  it('findByProjectId() should return the task with the applied filters', async () => {
    const filter = {
      status: TASK_STATUS.TODO,
      priority: PRIORITY.HIGH,
      assigneeId: mockUserId,
    };

    const result = await drizzleTaskRepository.findByProjectId(mockProjectId, filter);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toBeInstanceOf(Task);
    expect(result[0].projectId).toBe(mockProjectId);
  });

  it('findById() should return null if the task was not found by its id', async () => {
    const result = await drizzleTaskRepository.findById('123-abc');

    expect(result).toBeNull();
  });

  it('findById() should return the task filtered by its id', async () => {
    const result = await drizzleTaskRepository.findById(mockTasktId);

    expect(result).toBeInstanceOf(Task);
    expect(result?.id).toBe(mockTasktId);
  });

  it('update() should update the task correctly', async () => {
    const task = await drizzleTaskRepository.findById(mockTasktId);
    expect(task).not.toBeNull();
    task!.updateStatus(TASK_STATUS.IN_PROGRESS);
    await drizzleTaskRepository.update(task!);

    const updatedTask = await drizzleTaskRepository.findById(mockTasktId);
    expect(updatedTask!.status).toBe(TASK_STATUS.IN_PROGRESS);
  });

  it('should throw an error if trying to insert a task with an id that already exists', async () => {
    await expect(() => drizzleTaskRepository.save(Task.create(inputTask))).rejects.toThrow();
  });
});
