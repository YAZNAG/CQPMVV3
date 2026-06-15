import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { RolesPermissionsMatrix } from "@/components/admin/roles-permissions-matrix";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default async function AdminRolesPage() {
  await requirePermission("users", "read");

  return (
    <AdminPageShell
      title="Rôles & permissions"
      description="Matrice des droits d'accès par rôle. Les permissions sont appliquées côté serveur (RBAC)."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Rôles" },
      ]}
      actions={
        <Button
          variant="outline"
          size="sm"
          className="border-slate-200 bg-white shadow-sm hover:bg-slate-50"
          asChild
        >
          <Link href="/admin/users">
            <Users className="h-4 w-4 text-ocean-600" />
            Utilisateurs
          </Link>
        </Button>
      }
    >
      <RolesPermissionsMatrix />
    </AdminPageShell>
  );
}
