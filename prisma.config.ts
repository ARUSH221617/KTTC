import { defineConfig, env } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'db/schema.prisma',
  migrations: {
    seed: 'tsx db/seed.ts',
  },
  datasource: {
    url: env('DB_DATABASE_URL'),
  },
});
