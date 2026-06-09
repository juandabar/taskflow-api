import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const RegisterUserSchema = z
  .object({
    name: z.string().min(5),
    email: z.email(),
    password: z.string().min(8),
  })
  .openapi('RegisterUserRequest');

export const LoginUserSchema = RegisterUserSchema.pick({
  email: true,
  password: true,
}).openapi('LoginUserRequest');

export const PathParamsUserSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi('UserPathParams');

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
export type LoginUserDto = z.infer<typeof LoginUserSchema>;
export type PathParamsUserDto = z.infer<typeof PathParamsUserSchema>;
