import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from './config/env.js';

import { JwtService } from '../adapters/driven/security/JwtService.js';
import { BcryptPasswordHasher } from '../adapters/driven/security/BcryptPasswordHasher.js';

import { DrizzleUserRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleUserRepository.js';
import { DrizzleProjectRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleProjectRepository.js';

import { RegisterUserUseCase } from '../domain/use-cases/auth/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../domain/use-cases/auth/LoginUserUseCase.js';
import { ListUsersUseCase } from '../domain/use-cases/user/ListUsersUseCase.js';

import { UserController } from '../adapters/driving/http/controllers/UserController.js';
import { ProjectController } from '../adapters/driving/http/controllers/ProjectController.js';

import { createAuthGuard } from '../adapters/driving/http/middlewares/authGuard.js';
import { GetUserByIdUseCase } from '../domain/use-cases/user/GetUserByIdUseCase.js';
import { CreateProjectUseCase } from '../domain/use-cases/project/CreateProjectUseCase.js';
import { ListProjectsUseCase } from '../domain/use-cases/project/ListProjectsUseCase.js';
import { GetProjectByIdUseCase } from '../domain/use-cases/project/GetProjectByIdUseCase.js';
import { ArchiveProjectUseCase } from '../domain/use-cases/project/ArchiveProjectUseCase.js';

const sqlite = new Database(env.DATABASE_PATH);
const db = drizzle(sqlite);

const jwtService = new JwtService();
const passwordHasher = new BcryptPasswordHasher();

const userRepository = new DrizzleUserRepository(db);
const projectRepository = new DrizzleProjectRepository(db);

const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, jwtService);
const listUsersUseCase = new ListUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

const createProjectUseCase = new CreateProjectUseCase(projectRepository);
const listProjectsUseCase = new ListProjectsUseCase(projectRepository);
const getProjectByIdUseCase = new GetProjectByIdUseCase(projectRepository);
const archiveProjectUseCase = new ArchiveProjectUseCase(projectRepository);

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

export const authGuard = createAuthGuard(jwtService);
