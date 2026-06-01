import 'dotenv/config';
import z from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(3003),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    JWT_SECRET: z.string().min(32),
    DATABASE_PATH: z.string(),
    LOG_LEVEL: z.enum(['debug', 'info', 'silent', 'warn', 'error']),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
}

export const env = result.data;