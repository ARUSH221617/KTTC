import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // 1. Check DB for any user
        const user = await db.user.findUnique({
          where: { email },
        });

        if (
          user &&
          user.password &&
          (await bcrypt.compare(password, user.password))
        ) {
          return {
            ...user,
            type: user.role ? (user.role.toUpperCase() as any) : "USER",
          } as any;
        }

        // 2. Fallback to Env Admin
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        if (email === adminEmail && password === adminPassword) {
          return {
            id: "admin",
            email: adminEmail,
            role: "admin",
            type: "ADMIN",
            name: "Administrator"
          } as any;
        }

        return null;
      },
    }),
  ],
});
