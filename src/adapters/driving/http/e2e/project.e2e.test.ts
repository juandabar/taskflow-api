import { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildTestApp } from './buildTestApp.js';
import { loginAs, projectAs, registerAs } from './helpers.js';

let app: FastifyInstance;
let mockToken: string;
const mockBadToken = 'd12dasd321d23dsa23d';
const mockBadProjectId = 'bace7ede-3650-4104-868d-f056f1b114b5';

describe('POST /projects', async () => {
  beforeEach(async () => {
    app = await buildTestApp();
    await registerAs(app);
    mockToken = await loginAs(app);
  });

  it('should respond with error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${mockBadToken}` },
      body: {
        name: 'Project A',
        description: 'Description A',
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with an error when the request body is incorrect', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        name: '',
        description: '',
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with the project successfully created', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${mockToken}` },
      body: {
        name: 'Project A',
        description: 'Description A',
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().name).toBe('Project A');
  });
});

describe('GET /projects', async () => {
  beforeEach(async () => {
    app = await buildTestApp();
    await registerAs(app);
    mockToken = await loginAs(app);
  });

  it('should respond with error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/projects',
      headers: { authorization: `Bearer ${mockBadToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 400 if the status does not match the allowed types', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/projects',
      headers: { authorization: `Bearer ${mockToken}` },
      query: {
        status: 'archivado',
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with status 200 when it responds correctly', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/projects',
      headers: { authorization: `Bearer ${mockToken}` },
      query: {
        status: 'ARCHIVED',
      },
    });

    expect(res.statusCode).toBe(200);
  });
});

describe('GET /projects/:id', () => {
  beforeEach(async () => {
    app = await buildTestApp();
    await registerAs(app);
    mockToken = await loginAs(app);
  });

  it('should respond with error 401 if the token has expired or is incorrect', async () => {
    const projectId = await projectAs(app, mockToken);

    const res = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}`,
      headers: { authorization: `Bearer ${mockBadToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 404 if the project does not exist', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/projects/${mockBadProjectId}`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should respond with 200 if the project was found', async () => {
    const projectId = await projectAs(app, mockToken);

    const res = await app.inject({
      method: 'GET',
      url: `/projects/${projectId}`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(projectId);
  });
});

describe('PATCH /projects/:id/archive', () => {
  beforeEach(async () => {
    app = await buildTestApp();
    await registerAs(app);
    mockToken = await loginAs(app);
  });

  it('should respond with error 401 if the token has expired or is incorrect', async () => {
    const projectId = await projectAs(app, mockToken);

    const res = await app.inject({
      method: 'PATCH',
      url: `/projects/${projectId}/archive`,
      headers: { authorization: `Bearer ${mockBadToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 404 if the project does not exist', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/projects/${mockBadProjectId}/archive`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should throw error 400 if the id is incorrect', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/projects/111-aaa-ccc/archive`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with error 403 if the project is already archived', async () => {
    const projectId = await projectAs(app, mockToken);

    await app.inject({
      method: 'PATCH',
      url: `/projects/${projectId}/archive`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    const res = await app.inject({
      method: 'PATCH',
      url: `/projects/${projectId}/archive`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().detail).toBe('the project is already archived');
  });

  it('should respond with 200 if the project was archived', async () => {
    const projectId = await projectAs(app, mockToken);

    const res = await app.inject({
      method: 'PATCH',
      url: `/projects/${projectId}/archive`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(200);
  });
});
