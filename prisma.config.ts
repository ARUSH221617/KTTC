import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'db/schema.prisma',
  datasource: {
    provider: 'postgresql',
    url: process.env.DB_DATABASE_URL ?? process.env.DATABASE_URL,
  },
});
