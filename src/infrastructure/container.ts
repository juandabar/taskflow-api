import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from './config/env.js';
import { DrizzleUserRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleUserRepository.js';
import { BcryptPasswordHasher } from '../adapters/driven/security/BcryptPasswordHasher.js';
import { RegisterUserUseCase } from '../domain/use-cases/auth/RegisterUserUseCase.js';
import { UserController } from '../adapters/driving/http/controllers/UserController.js';

const sqlite = new Database(env.DATABASE_PATH);
const db = drizzle(sqlite);

const userRepository = new DrizzleUserRepository(db);
const passwordHasher = new BcryptPasswordHasher();

const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);

const userController = new UserController(registerUserUseCase);

export { userController };
