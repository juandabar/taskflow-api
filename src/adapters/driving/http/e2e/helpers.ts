import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { FastifyInstance } from 'fastify';
import { RegisterUserUseCase } from '../../../../domain/use-cases/auth/RegisterUserUseCase.js';
import { USER_ROLE } from '../../../../domain/value-objects/UserRole.js';
import { DrizzleUserRepository } from '../../../driven/persistence/drizzle/repositories/DrizzleUserRepository.js';
import { BcryptPasswordHasher } from '../../../driven/security/BcryptPasswordHasher.js';

export const mockRegisterUser = {
  name: 'Juan Test',
  email: 'juan@test.com',
  password: 'Betplay2026*',
};

export const mockRegisterProject = {
  name: 'Project test A',
  description: 'The project test A',
};

export const mockRegisterTask = {
  title: 'Task test A',
  description: 'The task test A',
  priority: 'MEDIUM',
};

export async function registerAs(app: FastifyInstance): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/register',
    body: mockRegisterUser,
  });

  return res.json().id;
}

export async function loginAs(
  app: FastifyInstance,
  email?: string,
  password?: string,
): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/auth/login',
    body: {
      email: email ?? mockRegisterUser.email,
      password: password ?? mockRegisterUser.password,
    },
  });

  const result = res.json();
  return result.token;
}

export async function projectAs(app: FastifyInstance, token: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/projects',
    headers: { authorization: `Bearer ${token}` },
    body: mockRegisterProject,
  });
  return res.json().id as string;
}

export async function taskAs(
  app: FastifyInstance,
  token: string,
  projectId: string,
): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/tasks',
    headers: { authorization: `Bearer ${token}` },
    body: {
      ...mockRegisterTask,
      projectId,
    },
  });
  return res.json().id as string;
}

export async function generateComment(app: FastifyInstance, taskId: string): Promise<string> {
  await app.inject({
    method: 'POST',
    url: '/auth/register',
    body: {
      name: 'Juan2 Test',
      email: 'juan2@test.com',
      password: 'Betplay2026*',
    },
  });

  const token = await loginAs(app, 'juan2@test.com', 'Betplay2026*');

  const comment = await app.inject({
    method: 'POST',
    url: '/comments',
    headers: { authorization: `Bearer ${token}` },
    body: {
      content: 'content comment A',
      taskId,
    },
  });

  return comment.json().id as string;
}

export async function registerUserAdmin(
  db: BetterSQLite3Database,
  app: FastifyInstance,
): Promise<string> {
  const userRepository = new DrizzleUserRepository(db);
  const passwordHasher = new BcryptPasswordHasher();
  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);

  await registerUserUseCase.execute({
    name: 'Admin',
    email: 'admin@taskflow.com',
    password: 'Betplay2026*',
    role: USER_ROLE.ADMIN,
  });

  return await loginAs(app, 'admin@taskflow.com', 'Betplay2026*');
}
