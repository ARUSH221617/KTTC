import { randomBytes } from 'crypto';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// Secret key for JWT
// In production, this MUST be set in environment variables.
// If missing in development, we fallback to a hardcoded string.
// If missing in production, we generate a random one to prevent crash, but sessions will be invalidated on restart.
const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'development'
    ? 'fallback_jwt_secret_for_development'
    : randomBytes(32).toString('hex')
);

const JWT_SECRET = new TextEncoder().encode(secret);

if (!process.env.AUTH_SECRET && !process.env.JWT_SECRET && process.env.NODE_ENV !== 'development') {
  console.warn('WARN: AUTH_SECRET or JWT_SECRET is not defined. Using a generated temporary secret. Sessions will be invalidated on server restart.');
}

/**
 * Creates an admin session token using JWT.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} email - The email of the user.
 * @returns {Promise<string>} A promise that resolves to the signed JWT token.
 */
export async function createAdminSession(userId: string, email: string): Promise<string> {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Validates an admin session token.
 *
 * @param {string} token - The JWT token to validate.
 * @returns {Promise<boolean>} A promise that resolves to true if valid, false otherwise.
 */
export async function validateAdminSession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

/**
 * Retrieves data from an admin session token.
 *
 * @param {string} token - The JWT token to decode.
 * @returns {Promise<{ userId: string; email: string } | null>} The session payload or null if invalid.
 */
export async function getAdminSessionData(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: string; email: string };
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
}

/**
 * Clears an admin session.
 * For JWT, this is client-side, so this function is a placeholder/helper.
 *
 * @returns {boolean} Always returns true.
 */
export function clearAdminSession(): boolean {
  // For JWT, we don't actually clear anything server-side
  // The client needs to remove the cookie
  return true;
}

/**
 * Verifies admin credentials against the database.
 *
 * @param {string} email - The email address.
 * @param {string} password - The password.
 * @returns {Promise<object|null>} The user object if credentials are valid, null otherwise.
 */
export async function checkAdminCredentials(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }

  return null;
}

/**
 * NextAuth configuration options.
 */
export const authOptions = {
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
  secret: secret,
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
