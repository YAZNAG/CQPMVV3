import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { UsersTable } from "@/components/admin/users-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await requirePermission("users", "read");
  const canWrite = hasPermission(session.user.role, "users", "write");

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return (
    <AdminPageShell
      title="Utilisateurs"
      description="Comptes staff avec accès à l'administration. Gestion des rôles réservée au super administrateur."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Utilisateurs" },
      ]}
      actions={
        <Button
          variant="outline"
          size="sm"
          className="border-slate-200 bg-white shadow-sm hover:bg-slate-50"
          asChild
        >
          <Link href="/admin/roles">
            <Shield className="h-4 w-4 text-ocean-600" />
            Matrice des rôles
          </Link>
        </Button>
      }
    >
      <UsersTable
        users={users}
        currentUserId={session.user.id}
        canWrite={canWrite}
      />
    </AdminPageShell>
  );
}
