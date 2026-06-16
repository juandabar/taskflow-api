import { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
import { PRIORITY } from '../../../../domain/value-objects/Priority.js';
import { TASK_STATUS } from '../../../../domain/value-objects/TaskStatus.js';
import { buildTestApp } from './buildTestApp.js';
import { loginAs, mockRegisterTask, projectAs, registerAs, taskAs } from './helpers.js';

let app: FastifyInstance;
let mockToken: string;
let mockProjectId: string;
let mockTaskId: string;

const mockBadToken = 'd12dasd321d23dsa23d';

describe('POST /tasks', () => {
  beforeEach(async () => {
    const utils = await buildTestApp();
    app = utils[0];
    await registerAs(app);
    mockToken = await loginAs(app);
    mockProjectId = await projectAs(app, mockToken);
  });

  it('should throw error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockBadToken}` },
      body: {
        ...mockRegisterTask,
        projectId: mockProjectId,
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 400 when the request body is incorrect', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockToken}` },
      body: mockRegisterTask,
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with error 404 when the project was not found', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        ...mockRegisterTask,
        projectId: '0226ab00-8719-4ed8-8731-f5e36d908b6e',
      },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should respond with error 409 when trying to create a task for an archived project', async () => {
    await app.inject({
      method: 'PATCH',
      url: `/projects/${mockProjectId}/archive`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        ...mockRegisterTask,
        projectId: mockProjectId,
      },
    });

    expect(res.statusCode).toBe(409);
  });

  it('should respond with 201 when the task was created successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        ...mockRegisterTask,
        projectId: mockProjectId,
      },
    });

    expect(res.statusCode).toBe(201);
  });
});

describe('GET /tasks', () => {
  beforeEach(async () => {
    const utils = await buildTestApp();
    app = utils[0];
    await registerAs(app);
    mockToken = await loginAs(app);
    mockProjectId = await projectAs(app, mockToken);
  });

  it('should throw error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockBadToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 400 when the request is incorrect', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockToken}` },
      query: {
        status: 'activo',
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with error 404 when the project was not found', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockToken}` },
      query: {
        projectId: '0226ab00-8719-4ed8-8731-f5e36d908b6e',
      },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should respond with 200 if the task was filtered correctly', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockToken}` },
      query: {
        projectId: mockProjectId,
      },
    });

    expect(res.statusCode).toBe(200);
  });

  it('should respond with 200 if it found the task with filters', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/tasks',
      headers: { authorization: `Bearer ${mockToken}` },
      query: {
        projectId: mockProjectId,
        status: TASK_STATUS.TODO,
        priority: PRIORITY.MEDIUM,
      },
    });

    expect(res.statusCode).toBe(200);
  });
});

describe('GET /tasks/:id', () => {
  beforeEach(async () => {
    const utils = await buildTestApp();
    app = utils[0];
    await registerAs(app);
    mockToken = await loginAs(app);
    mockProjectId = await projectAs(app, mockToken);
    mockTaskId = await taskAs(app, mockToken, mockProjectId);
  });

  it('should throw error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/tasks/${mockTaskId}`,
      headers: { authorization: `Bearer ${mockBadToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 400 when the request is incorrect', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/tasks/1234567-abc',
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with error 404 when the task was not found', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/tasks/0226ab00-8719-4ed8-8731-f5e36d908b6e',
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should respond with 200 when the task was found', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/tasks/${mockTaskId}`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(200);
  });
});

describe('PATCH /tasks/:id', () => {
  beforeEach(async () => {
    const utils = await buildTestApp();
    app = utils[0];
    await registerAs(app);
    mockToken = await loginAs(app);
    mockProjectId = await projectAs(app, mockToken);
    mockTaskId = await taskAs(app, mockToken, mockProjectId);
  });

  it('should throw error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/tasks/${mockTaskId}`,
      headers: { authorization: `Bearer ${mockBadToken}` },
      body: {
        status: TASK_STATUS.IN_PROGRESS,
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 400 if the request is incorrect', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/tasks/${mockTaskId}`,
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        status: 'en_progreso',
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with error 404 when the task was not found', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/tasks/fda1ba1b-cf4d-4c53-8a28-99527049153d',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        status: TASK_STATUS.IN_PROGRESS,
      },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should respond with 200 when the task was updated successfully', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/tasks/${mockTaskId}`,
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        status: TASK_STATUS.IN_PROGRESS,
      },
    });

    expect(res.statusCode).toBe(200);
  });
});

describe('PATCH /tasks/:id/assign', () => {
  let mockUserId: string;

  beforeEach(async () => {
    const utils = await buildTestApp();
    app = utils[0];
    mockUserId = await registerAs(app);
    mockToken = await loginAs(app);
    mockProjectId = await projectAs(app, mockToken);
    mockTaskId = await taskAs(app, mockToken, mockProjectId);
  });

  it('should throw error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/tasks/${mockTaskId}/assign`,
      headers: { authorization: `Bearer ${mockBadToken}` },
      body: {
        userId: mockUserId,
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 404 when the task was not found', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/tasks/fda1ba1b-cf4d-4c53-8a28-99527049153d/assign',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        userId: mockUserId,
      },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should respond with error 400 if the request is incorrect', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/tasks/123489-abc/assign',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        userId: mockUserId,
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with 200 when the task was assigned correctly', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/tasks/${mockTaskId}/assign`,
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        userId: mockUserId,
      },
    });

    expect(res.statusCode).toBe(200);
  });
});
