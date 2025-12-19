import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "ADMIN";
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnChat = nextUrl.pathname.startsWith("/chat");
      const isOnLogin = nextUrl.pathname === "/login";
      const isOnAdminApi = nextUrl.pathname.startsWith("/api/admin");

      // Admin API protection
      if (isOnAdminApi) {
          if (!isLoggedIn || !isAdmin) {
              return false; // Returns 401
          }
          return true;
      }

      // Admin Pages protection
      if (isOnAdmin) {
        if (!isLoggedIn) {
          return false; // Redirects to login
        }
        if (!isAdmin) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Chat Page protection
      if (isOnChat) {
        if (!isLoggedIn) {
          return false; // Redirects to login
        }
        if (!isAdmin) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Login page redirection
      if (isOnLogin) {
        if (isLoggedIn) {
          if (isAdmin) {
             return Response.redirect(new URL("/admin", nextUrl));
          }
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
