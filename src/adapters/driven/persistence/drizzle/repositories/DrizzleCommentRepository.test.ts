import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { beforeEach, describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { DrizzleCommentRepository } from './DrizzleCommentRepository.js';
import { ICommentRepository } from '../../../../../domain/ports/driven/ICommentRepository.js';
import { USER_ROLE } from '../../../../../domain/value-objects/UserRole.js';
import { TASK_STATUS } from '../../../../../domain/value-objects/TaskStatus.js';
import { PRIORITY } from '../../../../../domain/value-objects/Priority.js';
import { DrizzleTaskRepository } from './DrizzleTaskRepository.js';
import { ITaskRepository } from '../../../../../domain/ports/driven/ITaskRepository.js';
import { IUserRepository } from '../../../../../domain/ports/driven/IUserRepository.js';
import { DrizzleUserRepository } from './DrizzleUserRepository.js';
import { User } from '../../../../../domain/entities/User.js';
import { Task } from '../../../../../domain/entities/Task.js';
import { Comment } from '../../../../../domain/entities/Comment.js';
import { PROJECT_STATUS } from '../../../../../domain/value-objects/ProjectStatus.js';
import { DrizzleProjectRepository } from './DrizzleProjectRepository.js';
import { IProjectRepository } from '../../../../../domain/ports/driven/IProjectRepository.js';
import { Project } from '../../../../../domain/entities/Project.js';

let sqlite: InstanceType<typeof Database>;
let db: BetterSQLite3Database;

let drizzleUserRepository: IUserRepository;
let drizzleProjectRepository: IProjectRepository;
let drizzleTaskRepository: ITaskRepository;
let drizzleCommentRepository: ICommentRepository;

const mockUserId = randomUUID();
const mockTasktId = randomUUID();
const mockProjectId = randomUUID();
const mockCommentId = randomUUID();
const mockDueDate = new Date();
mockDueDate.setMinutes(mockDueDate.getMinutes() + 5);

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

const inputComment = {
  id: mockCommentId,
  content: 'Comment A',
  taskId: mockTasktId,
  authorId: mockUserId,
  createdAt: new Date(),
};

describe('DrizzleCommentRepository', () => {
  beforeEach(async () => {
    sqlite = new Database(':memory:');
    db = drizzle(sqlite);
    migrate(db, { migrationsFolder: './src/adapters/driven/persistence/drizzle/migrations' });

    drizzleUserRepository = new DrizzleUserRepository(db);
    drizzleProjectRepository = new DrizzleProjectRepository(db);
    drizzleTaskRepository = new DrizzleTaskRepository(db);
    drizzleCommentRepository = new DrizzleCommentRepository(db);

    await drizzleUserRepository.save(User.create(inputUser));
    await drizzleProjectRepository.save(Project.create(inputProject));
    await drizzleTaskRepository.save(Task.create(inputTask));
    await drizzleCommentRepository.save(Comment.create(inputComment));
  });

  it('findById() should return null if the comment filtered by id was not found', async () => {
    const result = await drizzleCommentRepository.findById('123-abc');

    expect(result).toBeNull();
  });

  it('findById() should return the comment filtered by id', async () => {
    const result = await drizzleCommentRepository.findById(mockCommentId);

    expect(result).toBeInstanceOf(Comment);
    expect(result!.id).toBe(mockCommentId);
  });

  it('save() should throw an error when trying to insert a comment with an id that is already registered', async () => {
    await expect(() =>
      drizzleCommentRepository.save(Comment.create(inputComment)),
    ).rejects.toThrow();
  });

  it('delete() should delete the comment correctly', async () => {
    await drizzleCommentRepository.delete(mockCommentId);
    const deletedComment = await drizzleCommentRepository.findById(mockCommentId);
    expect(deletedComment).toBeNull();
  });
});
