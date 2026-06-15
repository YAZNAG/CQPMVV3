import type { UserRole } from "@prisma/client";
import { PERMISSIONS, type PermissionResource } from "./rbac";

/** Dashboard visible to any authenticated staff */
export function canAccessDashboard(): boolean {
  return true;
}

export function canAccessAudit(role: UserRole): boolean {
  return PERMISSIONS.audit.read.includes(role);
}

export function canAccessNavItem(
  role: UserRole,
  resource: PermissionResource | "dashboard" | "audit"
): boolean {
  if (resource === "dashboard") return canAccessDashboard();
  if (resource === "audit") return canAccessAudit(role);
  return PERMISSIONS[resource].read.includes(role);
}

export function getRoleMatrix() {
  const resources = Object.keys(PERMISSIONS) as PermissionResource[];
  const roles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

  return resources.map((resource) => ({
    resource,
    permissions: {
      read: roles.filter((r) => PERMISSIONS[resource].read.includes(r)),
      write: roles.filter((r) => PERMISSIONS[resource].write.includes(r)),
    },
  }));
}
