import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "./password";
import { createAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/security/rate-limit";

export type AuthorizeMeta = {
  ip?: string;
  userAgent?: string;
};

export function createCredentialsProvider(
  getMeta?: () => AuthorizeMeta | Promise<AuthorizeMeta>
) {
  return Credentials({
    id: "credentials",
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const meta = (await getMeta?.()) ?? {};
      const ip = meta.ip ?? "unknown";

      const rate = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
      if (!rate.success) {
        return null;
      }

      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const email = parsed.data.email;

      const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
      });

      if (!user || !user.isActive) {
        try {
          await createAuditLog({
            action: "LOGIN",
            entity: "User",
            metadata: { success: false, reason: "invalid_credentials", email },
            ipAddress: ip,
            userAgent: meta.userAgent,
          });
        } catch {
          /* audit must not block auth */
        }
        return null;
      }

      const valid = await verifyPassword(parsed.data.password, user.passwordHash);
      if (!valid) {
        try {
          await createAuditLog({
            userId: user.id,
            action: "LOGIN",
            entity: "User",
            entityId: user.id,
            metadata: { success: false, reason: "invalid_password" },
            ipAddress: ip,
            userAgent: meta.userAgent,
          });
        } catch {
          /* audit must not block auth */
        }
        return null;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      try {
        await createAuditLog({
          userId: user.id,
          action: "LOGIN",
          entity: "User",
          entityId: user.id,
          metadata: { success: true },
          ipAddress: ip,
          userAgent: meta.userAgent,
        });
      } catch {
        /* audit must not block auth */
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        image: user.image,
      };
    },
  });
}
