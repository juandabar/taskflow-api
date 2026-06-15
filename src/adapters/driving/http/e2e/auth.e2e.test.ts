import { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildTestApp } from './buildTestApp.js';
import { mockRegisterUser } from './helpers.js';

let app: FastifyInstance;

describe('POST /auth/register', () => {
  beforeEach(async () => {
    app = await buildTestApp();
  });

  it('should register a user and return 201', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      body: mockRegisterUser,
    });

    expect(res.statusCode).toBe(201);

    const result = res.json();
    expect(result.email).toBe('juan@test.com');
    expect(result.passwordHash).toBeUndefined();
  });

  it('should throw an error if the email is already registered', async () => {
    await app.inject({
      method: 'POST',
      url: '/auth/register',
      body: mockRegisterUser,
    });

    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      body: mockRegisterUser,
    });
    expect(res.statusCode).toBe(409);

    const result = res.json();
    expect(result.detail).toBe('The email already exists');
  });

  it('should throw an error when the request body is not sent correctly', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/register',
      body: {
        ...mockRegisterUser,
        password: '',
      },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    app = await buildTestApp();

    await app.inject({
      method: 'POST',
      url: '/auth/register',
      body: mockRegisterUser,
    });
  });

  it('should respond with an error when the credentials are incorrect', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      body: {
        email: mockRegisterUser.email,
        password: '123-abc-ABC',
      },
    });

    expect(res.statusCode).toBe(401);

    const result = res.json();
    expect(result.detail).toBe('the entered credentials are incorrect');
  });

  it('should respond with an error 400 when the request body is incorrect', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      body: {
        password: mockRegisterUser.password,
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should respond with the login token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      body: {
        email: mockRegisterUser.email,
        password: mockRegisterUser.password,
      },
    });

    expect(res.json().token).toBeDefined();
  });
});
