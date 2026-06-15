import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { auth } from "./auth-instance";
import {
  hasPermission,
  type PermissionAction,
  type PermissionResource,
} from "./rbac";
import { ADMIN_LOGIN_PATH, ADMIN_UNAUTHORIZED_PATH } from "./constants";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(ADMIN_LOGIN_PATH);
  }
  return session;
}

export async function requireRole(allowed: UserRole[]) {
  const session = await requireAuth();
  if (!allowed.includes(session.user.role)) {
    redirect(ADMIN_UNAUTHORIZED_PATH);
  }
  return session;
}

export async function requirePermission(
  resource: PermissionResource,
  action: PermissionAction
) {
  const session = await requireAuth();
  if (!hasPermission(session.user.role, resource, action)) {
    redirect(ADMIN_UNAUTHORIZED_PATH);
  }
  return session;
}

/** For Server Actions — throws instead of redirect */
export async function assertPermission(
  resource: PermissionResource,
  action: PermissionAction
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  if (!hasPermission(session.user.role, resource, action)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
