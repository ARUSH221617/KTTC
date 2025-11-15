import path from "node:path";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

type Env = {
  DATABASE_URL: string
}
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
  engine: "classic",
  datasource: {
    url: env<Env>("DATABASE_URL"),
  },
});
