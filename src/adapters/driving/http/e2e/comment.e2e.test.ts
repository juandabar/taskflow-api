import { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildTestApp } from './buildTestApp.js';
import { loginAs, projectAs, registerAs, taskAs } from './helpers.js';

let app: FastifyInstance;
let mockToken: string;
let mockUserId: string;
let mockProjectId: string;
let mockTaskId: string;

const mockBadToken = 'd12dasd321d23dsa23d';

describe('POST /comments', () => {
  beforeEach(async () => {
    app = await buildTestApp();
    mockUserId = await registerAs(app);
    mockToken = await loginAs(app);
    mockProjectId = await projectAs(app, mockToken);
    mockTaskId = await taskAs(app, mockToken, mockProjectId);
  });

  it('should respond with error 400 if the request body is sent incorrectly', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/comments',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        content: '',
        taskId: mockTaskId,
        authorId: mockUserId,
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should throw error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/comments',
      headers: { authorization: `Bearer ${mockBadToken}` },
      body: {
        content: 'content comment A',
        taskId: mockTaskId,
        authorId: mockUserId,
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with 201 if the comment was created successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/comments',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        content: 'content comment A',
        taskId: mockTaskId,
        authorId: mockUserId,
      },
    });

    expect(res.statusCode).toBe(201);
  });
});

describe('DELETE /comments/:id', () => {
  beforeEach(async () => {
    app = await buildTestApp();
    mockUserId = await registerAs(app);
    mockToken = await loginAs(app);
    mockProjectId = await projectAs(app, mockToken);
    mockTaskId = await taskAs(app, mockToken, mockProjectId);
  });

  it('should throw error 401 if the token has expired or is incorrect', async () => {
    const comment = await app.inject({
      method: 'POST',
      url: '/comments',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        content: 'content comment A',
        taskId: mockTaskId,
        authorId: mockUserId,
      },
    });

    const res = await app.inject({
      method: 'DELETE',
      url: `/comments/${comment.json().id}`,
      headers: { authorization: `Bearer ${mockBadToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with 204 if the comment was deleted successfully', async () => {
    const comment = await app.inject({
      method: 'POST',
      url: '/comments',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        content: 'content comment A',
        taskId: mockTaskId,
        authorId: mockUserId,
      },
    });

    const res = await app.inject({
      method: 'DELETE',
      url: `/comments/${comment.json().id}`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(204);
  });
});
