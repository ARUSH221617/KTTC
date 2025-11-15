
import { randomBytes } from 'crypto';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';
import bcrypt from 'bcryptjs';

// In-memory session store (in production, use a database or Redis)
const adminSessions = new Map<string, { userId: string; email: string; createdAt: Date }>();

// Function to create an admin session and return a session token
export function createAdminSession(userId: string, email: string): string {
  // Generate a secure random session token
  const sessionToken = randomBytes(32).toString('hex');

  // Store session data
  adminSessions.set(sessionToken, {
    userId,
    email,
    createdAt: new Date(),
  });

  return sessionToken;
}

// Function to validate an admin session token
export function validateAdminSession(token: string): boolean {
  return adminSessions.has(token);
}

// Function to get admin session data
export function getAdminSessionData(token: string) {
  return adminSessions.get(token);
}

// Function to clear an admin session
export function clearAdminSession(token: string): boolean {
  return adminSessions.delete(token);
}

// Function to check admin credentials
export async function checkAdminCredentials(email: string, password: string) {
  // In a real application, you might want to check against a specific admin user
  // For now, we'll check against environment variables or default values
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email === adminEmail && password === adminPassword) {
    return { id: "admin", email: adminEmail }; // Return a basic admin user object
  }

  // Also check if this is a user with admin role in the database
  const user = await db.user.findUnique({
    where: { email },
  });

  if (user && bcrypt.compareSync(password, user.password)) {
    // Since role field doesn't exist in the current schema, we only check the default admin credentials
    // In a real application, you would add role field to the User schema
    return user;
  }

  return null;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (user && bcrypt.compareSync(credentials.password as string, user.password)) {
          return user;
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
