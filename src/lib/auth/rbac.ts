import type { UserRole } from "@prisma/client";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  EDITOR: 1,
};

export const PERMISSIONS = {
  users: {
    read: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
    write: ["SUPER_ADMIN"] as UserRole[],
  },
  admissions: {
    read: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
    write: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
  },
  formations: {
    read: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as UserRole[],
    write: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
  },
  news: {
    read: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as UserRole[],
    write: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as UserRole[],
  },
  gallery: {
    read: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as UserRole[],
    write: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as UserRole[],
  },
  testimonials: {
    read: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as UserRole[],
    write: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
  },
  contact: {
    read: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
    write: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
  },
  settings: {
    read: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
    write: ["SUPER_ADMIN"] as UserRole[],
  },
  navigation: {
    read: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
    write: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
  },
  pages: {
    read: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as UserRole[],
    write: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as UserRole[],
  },
  hero: {
    read: ["SUPER_ADMIN", "ADMIN", "EDITOR"] as UserRole[],
    write: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
  },
  audit: {
    read: ["SUPER_ADMIN", "ADMIN"] as UserRole[],
    write: [] as UserRole[],
  },
} as const;

export const ROLE_LABELS: Record<UserRole, { label: string; description: string }> = {
  SUPER_ADMIN: {
    label: "Super administrateur",
    description: "Accès complet, gestion des utilisateurs et paramètres système.",
  },
  ADMIN: {
    label: "Administrateur",
    description: "Gestion des candidatures, contenus et messages.",
  },
  EDITOR: {
    label: "Rédacteur",
    description: "Publication des actualités, galerie et formations.",
  },
};

export const RESOURCE_LABELS: Record<PermissionResource, string> = {
  users: "Utilisateurs",
  admissions: "Candidatures",
  formations: "Formations",
  news: "Actualités",
  gallery: "Galerie",
  testimonials: "Témoignages",
  contact: "Messages contact",
  settings: "Paramètres",
  navigation: "Navigation",
  pages: "Pages CMS",
  hero: "Hero / Slider",
  audit: "Audit",
};

export type PermissionResource = keyof typeof PERMISSIONS;
export type PermissionAction = "read" | "write";

export function hasPermission(
  role: UserRole,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  return PERMISSIONS[resource][action].includes(role);
}

export function hasMinimumRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}
