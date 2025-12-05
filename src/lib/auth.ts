import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Function to check admin credentials
export async function checkAdminCredentials(email: string, password: string) {
  // Check if this is a user with admin role in the database
  const user = await db.user.findUnique({
    where: { email },
  });

  if (user && user.password && (await bcrypt.compare(password, user.password))) {
    // Check if the user has admin role
    if (user.role === 'admin' || user.role === 'ADMIN') {
      return user;
    }
  }

  // Also check against environment variables as fallback for default admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email === adminEmail && password === adminPassword) {
    // Create a temporary user object for the default admin
    return { id: "admin", email: adminEmail, role: "admin" };
  }

  return null;
}

// Properly implement session creation with JWT
export async function createAdminSession(id: string, email: string): Promise<string> {
  const token = jwt.sign(
    { id, email, type: 'admin_session' },
    process.env.JWT_SECRET || 'fallback_jwt_secret_key',
    { expiresIn: '24h' }
  );
  return token;
}

// Function to verify admin session
export async function verifyAdminSession(token: string): Promise<{ id: string; email: string } | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret_key') as { id: string; email: string; type: string };
    if (decoded.type === 'admin_session') {
      return { id: decoded.id, email: decoded.email };
    }
    return null;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
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

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (
          user &&
          user.password &&
          (await bcrypt.compare(credentials.password as string, user.password))
        ) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
