import NextAuth from "next-auth";
import { headers } from "next/headers";
import { authConfig } from "./auth.config";
import { createCredentialsProvider } from "./credentials";
import { getClientIp } from "@/lib/security/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    createCredentialsProvider(async () => {
      const headersList = await headers();
      return {
        ip: getClientIp(headersList),
        userAgent: headersList.get("user-agent") ?? undefined,
      };
    }),
  ],
});
