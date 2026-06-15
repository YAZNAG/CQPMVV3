import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { ReclamationInbox } from "@/components/admin/reclamation-inbox";
import { Button } from "@/components/ui/button";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AlertCircle } from "lucide-react";

export default async function AdminReclamationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requirePermission("contact", "read");
  const canWrite = hasPermission(session.user.role, "contact", "write");
  const { status } = await searchParams;

  const statusFilter =
    status === "PENDING" ||
    status === "IN_REVIEW" ||
    status === "RESOLVED" ||
    status === "CLOSED"
      ? status
      : undefined;

  const [items, pending, inReview] = await Promise.all([
    prisma.reclamation.findMany({
      where: {
        deletedAt: null,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.reclamation.count({ where: { deletedAt: null, status: "PENDING" } }),
    prisma.reclamation.count({ where: { deletedAt: null, status: "IN_REVIEW" } }),
  ]);

  return (
    <AdminPageShell
      title="Réclamations"
      description="Réclamations déposées sur /contact/reclamation — statut et réponse au demandeur."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Réclamations" },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="En attente"
          value={pending}
          href="/admin/reclamations?status=PENDING"
          icon={AlertCircle}
          variant={pending > 0 ? "warning" : "default"}
        />
        <AdminStatCard
          label="En analyse"
          value={inReview}
          href="/admin/reclamations?status=IN_REVIEW"
          icon={AlertCircle}
        />
        <AdminStatCard
          label="Total affiché"
          value={items.length}
          href="/admin/reclamations"
          icon={AlertCircle}
        />
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="IN_REVIEW">En cours d&apos;analyse</option>
          <option value="RESOLVED">Traitées</option>
          <option value="CLOSED">Clôturées</option>
        </select>
        <Button type="submit" variant="ocean">
          Filtrer
        </Button>
        {statusFilter && (
          <Button variant="outline" asChild>
            <Link href="/admin/reclamations">Réinitialiser</Link>
          </Button>
        )}
      </form>

      <div className="mt-8">
        <ReclamationInbox items={items} canWrite={canWrite} />
      </div>
    </AdminPageShell>
  );
}
