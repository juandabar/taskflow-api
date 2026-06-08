import { z } from 'zod';

export const RegisterUserSchema = z.object({
  name: z.string().min(5),
  email: z.email(),
  password: z.string().min(8),
});

export const LoginUserSchema = RegisterUserSchema.pick({
  email: true,
  password: true,
});

export const PathParamsUserSchema = z.object({
  id: z.uuid(),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
export type LoginUserDto = z.infer<typeof LoginUserSchema>;
export type PathParamsUserDto = z.infer<typeof PathParamsUserSchema>;
