import path from "node:path";
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("db", "schema.prisma"),
  migrations: {
    path: path.join("db", "migrations"),
    seed: `tsx db/seed.ts`,
  },
  views: {
    path: path.join("db", "views"),
  },
  typedSql: {
    path: path.join("db", "queries"),
  },
});
