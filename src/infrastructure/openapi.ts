import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { OpenAPIV3 } from 'openapi-types';
import {
  LoginUserSchema,
  PathParamsUserSchema,
  RegisterUserSchema,
} from '../adapters/driving/http/schemas/user.schema.js';

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.register('RegisterUserRequest', RegisterUserSchema);
registry.register('LoginUserRequest', LoginUserSchema);
registry.register('UserPathParams', PathParamsUserSchema);

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterUserSchema,
        },
      },
    },
  },
  responses: {
    201: { description: 'User registered successfully' },
    409: { description: 'Email already in use' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Log in',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginUserSchema,
        },
      },
    },
  },
  responses: {
    201: { description: 'Logged user token' },
    404: { description: 'Invalid credentials error' },
    401: { description: 'Invalid credentials error' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/user/list',
  tags: ['Users'],
  summary: 'List all users',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Array with the registered users' },
    403: { description: 'Endpoint only for admins' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/user/{id}',
  tags: ['Users'],
  summary: 'Get the user filtered by id',
  security: [{ bearerAuth: [] }],
  request: {
    params: PathParamsUserSchema,
  },
  responses: {
    200: { description: 'User found' },
    400: { description: 'Required parameters' },
    404: { description: 'User not found' },
  },
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
    },
  }) as unknown as OpenAPIV3.Document;
}
