import { FastifyInstance } from 'fastify';

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
