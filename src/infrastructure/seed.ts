import Database from 'better-sqlite3';
import { logger } from './logger.js';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from './config/env.js';
import { RegisterUserUseCase } from '../domain/use-cases/auth/RegisterUserUseCase.js';
import { BcryptPasswordHasher } from '../adapters/driven/security/BcryptPasswordHasher.js';
import { DrizzleUserRepository } from '../adapters/driven/persistence/drizzle/repositories/DrizzleUserRepository.js';
import { USER_ROLE } from '../domain/value-objects/UserRole.js';

const sqlite = new Database(env.DATABASE_PATH);
const db = drizzle(sqlite);

const userRepository = new DrizzleUserRepository(db);
const passwordHasher = new BcryptPasswordHasher();
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);

try {
  await registerUserUseCase.execute({
    name: 'Admin',
    email: 'admin@taskflow.com',
    password: 'Betplay2026*',
    role: USER_ROLE.ADMIN,
  });

  await registerUserUseCase.execute({
    name: 'Juan David',
    email: 'juandabar97@gmail.com',
    password: 'Betplay2026*',
    role: USER_ROLE.MEMBER,
  });
  logger.info('Admin user created');
} catch (error) {
  logger.error(error, 'Error::seed');
} finally {
  sqlite.close();
}
