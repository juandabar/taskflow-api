import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from './config/env.js';
import { DrizzleUserRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleUserRepository.js';
import { BcryptPasswordHasher } from '../adapters/driven/security/BcryptPasswordHasher.js';
import { RegisterUserUseCase } from '../domain/use-cases/auth/RegisterUserUseCase.js';
import { UserController } from '../adapters/driving/http/controllers/UserController.js';
import { LoginUserUseCase } from '../domain/use-cases/auth/LoginUserUseCase.js';
import { JwtService } from '../adapters/driven/security/JwtService.js';
import { ListUsersUseCase } from '../domain/use-cases/user/ListUsersUseCase.js';
import { createAuthGuard } from '../adapters/driving/http/middlewares/authGuard.js';
import { GetUserByIdUseCase } from '../domain/use-cases/user/GetUserByIdUseCase.js';

const sqlite = new Database(env.DATABASE_PATH);
const db = drizzle(sqlite);

const jwtService = new JwtService();
const userRepository = new DrizzleUserRepository(db);
const passwordHasher = new BcryptPasswordHasher();

const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, jwtService);
const listUsersUseCase = new ListUsersUseCase(userRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

export const userController = new UserController(
  registerUserUseCase,
  loginUserUseCase,
  listUsersUseCase,
  getUserByIdUseCase,
);

export const authGuard = createAuthGuard(jwtService);
