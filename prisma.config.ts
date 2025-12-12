// prisma.config.ts
import { defineConfig } from "@prisma/config";
import path from "path";

export default defineConfig({
  schema: path.join(__dirname, "db", "schema.prisma"),
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
});
