"use server";

import { AuthError } from "next-auth";
import { signIn, signOut, auth } from "@/lib/auth/auth-instance";
import { loginSchema } from "@/lib/validations/auth";
import { RATE_LIMITS, runPublicAction } from "@/lib/api";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/security/rate-limit";
import { headers } from "next/headers";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
} from "@/lib/auth/constants";
import type { ActionResult } from "@/types";
import type { LoginInput } from "@/lib/validations/auth";

export async function loginAction(
  input: unknown
): Promise<ActionResult<{ url: string }>> {
  return runPublicAction({
    name: "loginAction",
    rateLimit: RATE_LIMITS.login,
    schema: loginSchema,
    input,
    handler: async (_ctx, data) => {
      const { email, password } = data as LoginInput;
      try {
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        return { success: true, data: { url: ADMIN_HOME_PATH } };
      } catch (error) {
        if (error instanceof AuthError && error.type === "CredentialsSignin") {
          return { success: false, error: "Email ou mot de passe incorrect." };
        }
        return { success: false, error: "Email ou mot de passe incorrect." };
      }
    },
  });
}

export async function logoutAction(): Promise<void> {
  const session = await auth();
  if (session?.user?.id) {
    const headersList = await headers();
    await createAuditLog({
      userId: session.user.id,
      action: "LOGOUT",
      entity: "User",
      entityId: session.user.id,
      ipAddress: getClientIp(headersList),
      userAgent: headersList.get("user-agent") ?? undefined,
    });
  }
  await signOut({ redirectTo: ADMIN_LOGIN_PATH });
}
