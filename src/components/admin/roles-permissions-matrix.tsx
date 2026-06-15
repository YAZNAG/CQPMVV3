import Link from "next/link";
import type { UserRole } from "@prisma/client";
import { Check, Crown, PenLine, Shield, X } from "lucide-react";
import { AdminPanel, AdminTable } from "@/components/admin/admin-panel";
import {
  PERMISSIONS,
  RESOURCE_LABELS,
  ROLE_LABELS,
  type PermissionResource,
} from "@/lib/auth/rbac";
import { cn } from "@/lib/utils";

const ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

const ROLE_META: Record<
  UserRole,
  { icon: typeof Crown; accent: string; badge: string }
> = {
  SUPER_ADMIN: {
    icon: Crown,
    accent: "from-navy-900 to-ocean-600",
    badge: "bg-gradient-to-r from-navy-900 to-ocean-600 text-white",
  },
  ADMIN: {
    icon: Shield,
    accent: "from-ocean-500 to-ocean-700",
    badge: "bg-ocean-500/12 text-ocean-700 ring-1 ring-ocean-500/20",
  },
  EDITOR: {
    icon: PenLine,
    accent: "from-slate-500 to-slate-600",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  },
};

function PermissionPill({ allowed, label }: { allowed: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        allowed
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-50 text-slate-400 ring-1 ring-slate-100"
      )}
    >
      {allowed ? (
        <Check className="h-3 w-3 shrink-0" />
      ) : (
        <X className="h-3 w-3 shrink-0" />
      )}
      {label}
    </span>
  );
}

export function RolesPermissionsMatrix() {
  const resources = Object.keys(PERMISSIONS) as PermissionResource[];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {ROLES.map((role) => {
          const Icon = ROLE_META[role].icon;
          return (
            <AdminPanel
              key={role}
              className="relative overflow-hidden !p-5 transition-shadow hover:shadow-lg"
            >
              <div
                className={cn(
                  "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl",
                  ROLE_META[role].accent
                )}
                aria-hidden
              />
              <div className="relative flex items-start gap-4">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
                    ROLE_META[role].accent
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">
                    {ROLE_LABELS[role].label}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {ROLE_LABELS[role].description}
                  </p>
                  <span
                    className={cn(
                      "mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      ROLE_META[role].badge
                    )}
                  >
                    {role}
                  </span>
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>

      <AdminTable>
        <thead>
          <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white">
            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Module
            </th>
            {ROLES.map((role) => {
              const Icon = ROLE_META[role].icon;
              return (
                <th
                  key={role}
                  className="px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  <span className="inline-flex flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                        ROLE_META[role].accent
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="max-w-[7rem] leading-tight normal-case">
                      {ROLE_LABELS[role].label}
                    </span>
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {resources.map((resource) => (
            <tr key={resource} className="transition-colors hover:bg-slate-50/60">
              <td className="px-6 py-4">
                <span className="font-semibold text-slate-900">
                  {RESOURCE_LABELS[resource]}
                </span>
              </td>
              {ROLES.map((role) => {
                const canRead = PERMISSIONS[resource].read.includes(role);
                const canWrite = PERMISSIONS[resource].write.includes(role);
                return (
                  <td key={role} className="px-4 py-4">
                    <div className="flex flex-col items-center gap-2">
                      <PermissionPill allowed={canRead} label="Lecture" />
                      <PermissionPill allowed={canWrite} label="Écriture" />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </AdminTable>

      <AdminPanel className="!p-5">
        <p className="text-sm leading-relaxed text-slate-600">
          La modification des rôles utilisateurs se fait dans{" "}
          <Link
            href="/admin/users"
            className="font-semibold text-ocean-600 transition hover:text-ocean-700 hover:underline"
          >
            Utilisateurs
          </Link>{" "}
          <span className="rounded-full bg-ocean-500/10 px-2 py-0.5 text-xs font-semibold text-ocean-700">
            Super administrateur uniquement
          </span>
        </p>
      </AdminPanel>
    </div>
  );
}
