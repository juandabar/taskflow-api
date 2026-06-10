import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { OpenAPIV3 } from 'openapi-types';
import {
  LoginUserSchema,
  PathParamsUserSchema,
  RegisterUserSchema,
} from '../adapters/driving/http/schemas/user.schema.js';
import {
  CreateProjectSchema,
  FileProjectSchema,
  PathProjectSchema,
  QueryProjectSchema,
} from '../adapters/driving/http/schemas/project.schema.js';

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.register('RegisterUserRequest', RegisterUserSchema);
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

registry.register('LoginUserRequest', LoginUserSchema);
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
    401: { description: 'Invalid or expired token' },
  },
});

registry.register('UserPathParams', PathParamsUserSchema);
registry.registerPath({
  method: 'get',
  path: '/user/{id}',
  tags: ['Users'],
  summary: 'Get user by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: PathParamsUserSchema,
  },
  responses: {
    200: { description: 'User found' },
    400: { description: 'Invalid request parameters' },
    404: { description: 'User not found' },
    401: { description: 'Invalid or expired token' },
  },
});

registry.register('CreateProjectRequest', CreateProjectSchema);
registry.registerPath({
  method: 'post',
  path: '/projects',
  tags: ['Projects'],
  summary: 'Create project',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateProjectSchema,
        },
      },
    },
  },
  responses: {
    200: { description: 'Created Project' },
    400: { description: 'Invalid request body' },
    401: { description: 'Invalid or expired token' },
  },
});

registry.register('ProjectQuery', QueryProjectSchema);
registry.registerPath({
  method: 'get',
  path: '/projects',
  tags: ['Projects'],
  summary: 'List projects',
  security: [{ bearerAuth: [] }],
  request: {
    query: QueryProjectSchema,
  },
  responses: {
    200: { description: 'Projects' },
    401: { description: 'Invalid or expired token' },
  },
});

registry.register('ProjectPath', PathProjectSchema);
registry.registerPath({
  method: 'get',
  path: '/projects/{id}',
  tags: ['Projects'],
  summary: 'The project',
  security: [{ bearerAuth: [] }],
  request: {
    params: PathProjectSchema,
  },
  responses: {
    200: { description: 'Project found' },
    404: { description: 'Project not found' },
    401: { description: 'Invalid or expired token' },
  },
});

registry.register('FileProjectRequest', FileProjectSchema);
registry.registerPath({
  method: 'patch',
  path: '/projects/{id}/archive',
  tags: ['Projects'],
  summary: 'Archive project',
  security: [{ bearerAuth: [] }],
  request: {
    params: FileProjectSchema,
  },
  responses: {
    200: { description: 'Archived project' },
    400: { description: 'Invalid request' },
    403: { description: 'Action not permitted' },
    404: { description: 'Project not found' },
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
