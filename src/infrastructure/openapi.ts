import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import {
  LoginUserSchema,
  PathParamsUserSchema,
  RegisterUserSchema,
} from '../adapters/driving/http/schemas/user.schema.js';

export const registry = new OpenAPIRegistry();
