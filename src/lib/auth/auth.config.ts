import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  SESSION_MAX_AGE_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
} from "./constants";

/**
 * Edge-compatible Auth.js config (no Prisma/bcrypt).
 * Used by middleware and merged with server providers in index.ts.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: ADMIN_LOGIN_PATH,
    error: ADMIN_LOGIN_PATH,
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminArea = pathname.startsWith("/admin");
      const isLoginPage = pathname === ADMIN_LOGIN_PATH;
      const isUnauthorizedPage = pathname === "/admin/unauthorized";

      if (!isAdminArea) return true;

      if (isLoginPage || isUnauthorizedPage) {
        if (auth?.user) {
          return Response.redirect(new URL(ADMIN_HOME_PATH, request.nextUrl));
        }
        return true;
      }

      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: UserRole }).role!;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
