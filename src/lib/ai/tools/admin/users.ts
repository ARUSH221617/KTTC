import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tool } from "ai";
import * as bcrypt from "bcrypt-ts"; // Use bcrypt-ts for edge compatibility if needed, or bcryptjs

const checkAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
};

// Users
export const createUser = tool({
  description: "Create a new user. Requires admin privileges.",
  parameters: z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["user", "admin", "instructor"]).default("user"),
  }),
  execute: async ({ name, email, password, role }) => {
    await checkAdmin();
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "User already exists with this email" };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  },
});

export const updateUser = tool({
  description: "Update an existing user. Requires admin privileges.",
  parameters: z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(["user", "admin", "instructor"]).optional(),
    password: z.string().min(6).optional(),
  }),
  execute: async ({ id, name, email, role, password }) => {
    await checkAdmin();
    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 10);

    try {
        const user = await db.user.update({
            where: { id },
            data,
        });
        return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    } catch (e) {
        return { error: "Failed to update user. User might not exist." };
    }
  },
});

export const readUsers = tool({
  description: "List users with optional filtering. Requires admin privileges.",
  parameters: z.object({
    query: z.string().optional().describe("Search by name or email"),
    role: z.enum(["user", "admin", "instructor"]).optional(),
    limit: z.number().default(10),
  }),
  execute: async ({ query, role, limit }) => {
    await checkAdmin();
    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const users = await db.user.findMany({
      where,
      take: limit,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return { users };
  },
});
