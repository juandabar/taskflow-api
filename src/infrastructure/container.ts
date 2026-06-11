import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from './config/env.js';

import { BcryptPasswordHasher } from '../adapters/driven/security/BcryptPasswordHasher.js';
import { JwtService } from '../adapters/driven/security/JwtService.js';

import { DrizzleProjectRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleProjectRepository.js';
import { DrizzleUserRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleUserRepository.js';

import { LoginUserUseCase } from '../domain/use-cases/auth/LoginUserUseCase.js';
import { RegisterUserUseCase } from '../domain/use-cases/auth/RegisterUserUseCase.js';
import { ListUsersUseCase } from '../domain/use-cases/user/ListUsersUseCase.js';

import { ProjectController } from '../adapters/driving/http/controllers/ProjectController.js';
import { UserController } from '../adapters/driving/http/controllers/UserController.js';

import { DrizzleCommentRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleCommentRepository.js';
import { DrizzleTaskRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleTaskRepository.js';
import { CommentController } from '../adapters/driving/http/controllers/CommentController.js';
import { TaskController } from '../adapters/driving/http/controllers/TaskController.js';
import { createAuthGuard } from '../adapters/driving/http/middlewares/authGuard.js';
import { AddCommentUseCase } from '../domain/use-cases/comment/AddCommentUseCase.js';
import { ArchiveProjectUseCase } from '../domain/use-cases/project/ArchiveProjectUseCase.js';
import { CreateProjectUseCase } from '../domain/use-cases/project/CreateProjectUseCase.js';
import { GetProjectByIdUseCase } from '../domain/use-cases/project/GetProjectByIdUseCase.js';
import { ListProjectsUseCase } from '../domain/use-cases/project/ListProjectsUseCase.js';
import { AssignTaskUseCase } from '../domain/use-cases/task/AssignTaskUseCase.js';
import { CreateTaskUseCase } from '../domain/use-cases/task/CreateTaskUseCase.js';
import { GetTaskByIdUseCase } from '../domain/use-cases/task/GetTaskByIdUseCase.js';
import { ListTasksByProjectUseCase } from '../domain/use-cases/task/ListTasksByProjectUseCase.js';
import { UpdateTaskStatusUseCase } from '../domain/use-cases/task/UpdateTaskStatusUseCase.js';
import { GetUserByIdUseCase } from '../domain/use-cases/user/GetUserByIdUseCase.js';

const sqlite = new Database(env.DATABASE_PATH);
const db = drizzle(sqlite);

const jwtService = new JwtService();
const passwordHasher = new BcryptPasswordHasher();

// repositories
const userRepository = new DrizzleUserRepository(db);
const projectRepository = new DrizzleProjectRepository(db);
const taskRepository = new DrizzleTaskRepository(db);
const drizzleCommentRepository = new DrizzleCommentRepository(db);

// use cases - Users
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, jwtService);
const listUsersUseCase = new ListUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

// use cases - Projects
const createProjectUseCase = new CreateProjectUseCase(projectRepository);
const listProjectsUseCase = new ListProjectsUseCase(projectRepository);
const getProjectByIdUseCase = new GetProjectByIdUseCase(projectRepository);
const archiveProjectUseCase = new ArchiveProjectUseCase(projectRepository);

// use cases - Tasks
const createTaskUseCase = new CreateTaskUseCase(taskRepository, projectRepository);
const listTasksByProjectUseCase = new ListTasksByProjectUseCase(taskRepository);
const getTaskByIdUseCase = new GetTaskByIdUseCase(taskRepository);
const assignTaskUseCase = new AssignTaskUseCase(taskRepository);
const updateTaskStatusUseCase = new UpdateTaskStatusUseCase(taskRepository);

// use cases - comments
const addCommentUseCase = new AddCommentUseCase(drizzleCommentRepository);

// controller instances
export const userController = new UserController(
  registerUserUseCase,
  loginUserUseCase,
  listUsersUseCase,
  getUserByIdUseCase,
);
export const projectController = new ProjectController(
  createProjectUseCase,
  listProjectsUseCase,
  getProjectByIdUseCase,
  archiveProjectUseCase,
);
export const taskController = new TaskController(
  createTaskUseCase,
  listTasksByProjectUseCase,
  getTaskByIdUseCase,
  assignTaskUseCase,
  updateTaskStatusUseCase,
);
export const commentController = new CommentController(addCommentUseCase);

export const authGuard = createAuthGuard(jwtService);
