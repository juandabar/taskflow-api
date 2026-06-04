import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
    dialect: 'sqlite',
    schema: './src/adapters/driven/persistence/drizzle/schema/*',
    out: './src/adapters/driven/persistence/drizzle/migrations',
    dbCredentials: {
        url: process.env.DATABASE_PATH!
    },
});