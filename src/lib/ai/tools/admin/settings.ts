import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tool } from "ai";

const checkAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
};

export const readSettings = tool({
  description: "Read global application settings. Requires admin privileges.",
  parameters: z.object({}),
  execute: async () => {
    await checkAdmin();
    const settings = await db.setting.findMany();
    return { settings };
  },
});

export const updateSetting = tool({
  description: "Update a global application setting. Requires admin privileges.",
  parameters: z.object({
    key: z.string(),
    value: z.string(),
  }),
  execute: async ({ key, value }) => {
    await checkAdmin();
    const setting = await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return { success: true, setting };
  },
});
