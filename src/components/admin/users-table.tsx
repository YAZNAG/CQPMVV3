"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UserRole } from "@prisma/client";
import { Clock, Shield, UserCheck, Users } from "lucide-react";
import { updateUserAccess } from "@/actions/admin/users.actions";
import { AdminEmptyState, AdminPanel, AdminTable } from "@/components/admin/admin-panel";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import { cn, formatDate } from "@/lib/utils";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

const ROLE_STYLES: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-gradient-to-r from-navy-900 to-ocean-600 text-white",
  ADMIN: "bg-ocean-500/12 text-ocean-700 ring-1 ring-ocean-500/20",
  EDITOR: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

function userInitials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        ROLE_STYLES[role]
      )}
    >
      {ROLE_LABELS[role].label}
    </span>
  );
}

function ActiveToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-ocean-500" : "bg-slate-200",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export function UsersTable({
  users,
  currentUserId,
  canWrite,
}: {
  users: UserRow[];
  currentUserId: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeCount = users.filter((u) => u.isActive).length;

  const handleChange = (userId: string, role: UserRole, isActive: boolean) => {
    startTransition(async () => {
      const result = await updateUserAccess({ userId, role, isActive });
      if (result.success) {
        toast.success("Utilisateur mis à jour");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  if (users.length === 0) {
    return <AdminEmptyState>Aucun utilisateur enregistré.</AdminEmptyState>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminPanel className="flex items-center gap-4 !p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-navy-800 text-white shadow-md shadow-ocean-900/15">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total
            </p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
        </AdminPanel>

        <AdminPanel className="flex items-center gap-4 !p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <UserCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Actifs
            </p>
            <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
          </div>
        </AdminPanel>

        <AdminPanel className="flex items-center gap-4 !p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rôles
            </p>
            <p className="text-2xl font-bold text-slate-900">3</p>
          </div>
        </AdminPanel>
      </div>

      <AdminTable>
        <thead>
          <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white">
            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Utilisateur
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Rôle
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Statut
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Dernière connexion
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => {
            const isSelf = u.id === currentUserId;

            return (
              <tr
                key={u.id}
                className={cn(
                  "transition-colors hover:bg-slate-50/60",
                  isSelf && "bg-ocean-500/[0.03]"
                )}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm",
                        u.role === "SUPER_ADMIN"
                          ? "bg-gradient-to-br from-navy-900 to-ocean-600"
                          : u.role === "ADMIN"
                            ? "bg-gradient-to-br from-ocean-500 to-ocean-700"
                            : "bg-gradient-to-br from-slate-500 to-slate-600"
                      )}
                    >
                      {userInitials(u.name, u.email)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {u.name ?? "—"}
                        </p>
                        {isSelf && (
                          <Badge variant="ocean" className="px-2 py-0.5 text-[10px]">
                            Vous
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5">
                  {canWrite ? (
                    <select
                      defaultValue={u.role}
                      disabled={isPending}
                      className="w-full max-w-[220px] rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition focus:border-ocean-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                      onChange={(e) =>
                        handleChange(u.id, e.target.value as UserRole, u.isActive)
                      }
                    >
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role].label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <RoleBadge role={u.role} />
                  )}
                </td>

                <td className="px-6 py-5">
                  {canWrite ? (
                    <div className="flex items-center gap-3">
                      <ActiveToggle
                        checked={u.isActive}
                        disabled={isPending || isSelf}
                        onChange={(value) => handleChange(u.id, u.role, value)}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          u.isActive ? "text-emerald-700" : "text-slate-400"
                        )}
                      >
                        {u.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                      )}
                    >
                      {u.isActive ? "Actif" : "Inactif"}
                    </span>
                  )}
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      {u.lastLoginAt ? formatDate(u.lastLoginAt, "fr-FR") : "—"}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </AdminTable>
    </div>
  );
}
