import { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildTestApp } from './buildTestApp.js';
import { generateComment, loginAs, projectAs, registerAs, taskAs } from './helpers.js';

let app: FastifyInstance;
let mockToken: string;
let mockProjectId: string;
let mockTaskId: string;

const mockBadToken = 'd12dasd321d23dsa23d';

describe('POST /comments', () => {
  beforeEach(async () => {
    const utils = await buildTestApp();
    app = utils[0];
    await registerAs(app);
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
      },
    });

    expect(res.statusCode).toBe(201);
  });
});

describe('DELETE /comments/:id', () => {
  beforeEach(async () => {
    const utils = await buildTestApp();
    app = utils[0];
    await registerAs(app);
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
      },
    });

    const res = await app.inject({
      method: 'DELETE',
      url: `/comments/${comment.json().id}`,
      headers: { authorization: `Bearer ${mockBadToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 403 when trying to delete a comment that does not belong to the user', async () => {
    const commentId = await generateComment(app, mockTaskId);

    const res = await app.inject({
      method: 'DELETE',
      url: `/comments/${commentId}`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should respond with error 400 if the id is incorrect', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/comments/123-abc',
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with error 404 if the comment was not found', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/comments/bace7ede-3650-4104-868d-f056f1b114b5',
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should respond with 204 if the comment was deleted successfully', async () => {
    const comment = await app.inject({
      method: 'POST',
      url: '/comments',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        content: 'content comment A',
        taskId: mockTaskId,
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
