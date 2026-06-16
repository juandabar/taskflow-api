import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildTestApp } from './buildTestApp.js';
import { loginAs, registerAs, registerUserAdmin } from './helpers.js';

let app: FastifyInstance;
let mockToken: string;
let mockUserId: string;
const mockBadToken = 'd12dasd321d23dsa23d';

describe('GET /users/list', () => {
  let db: BetterSQLite3Database;

  beforeEach(async () => {
    const utils = await buildTestApp();
    app = utils[0];
    db = utils[1];
    await registerAs(app);
    mockToken = await loginAs(app);
  });

  it('should throw error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/users/list',
      headers: { authorization: `Bearer ${mockBadToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 403 if called by a role that is not admin', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/users/list',
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should respond with 200 if the endpoint was called by an admin', async () => {
    const token = await registerUserAdmin(db, app);

    const res = await app.inject({
      method: 'GET',
      url: '/users/list',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
  });
});

describe('GET /users/:id', () => {
  beforeEach(async () => {
    const utils = await buildTestApp();
    app = utils[0];
    mockUserId = await registerAs(app);
    mockToken = await loginAs(app);
  });

  it('should throw error 401 if the token has expired or is incorrect', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/users/${mockUserId}`,
      headers: { authorization: `Bearer ${mockBadToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should respond with error 400 if the id to search is incorrect', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/users/1234566787-abcdefg`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with error 404 if the user was not found', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/users/fda1ba1b-cf4d-4c53-8a28-99527049153d`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should respond with 200 if the user was found', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/users/${mockUserId}`,
      headers: { authorization: `Bearer ${mockToken}` },
    });

    expect(res.statusCode).toBe(200);
  });
});
