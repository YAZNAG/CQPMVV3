import { requirePermission } from "@/lib/auth/guards";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPanel, AdminTable } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import {
  listInscriptionApplications,
  getInscriptionStats,
} from "@/services/inscription-admin.service";
import { formatDate, cn } from "@/lib/utils";
import { FileText, Clock, CheckCircle, XCircle, Info, Eye } from "lucide-react";
import Link from "next/link";
import type { InscriptionStatus } from "@prisma/client";

const STATUS_LABELS: Record<InscriptionStatus, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-amber-100 text-amber-800" },
  IN_REVIEW: { label: "En cours", className: "bg-blue-100 text-blue-800" },
  INCOMPLETE: { label: "Incomplet", className: "bg-orange-100 text-orange-800" },
  ACCEPTED: { label: "Accepté", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Refusé", className: "bg-red-100 text-red-800" },
};

export default async function InscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requirePermission("admissions", "read");
  const sp = await searchParams;
  const search = sp.search ?? "";
  const statusFilter = (sp.status ?? "") as InscriptionStatus | "";
  const page = parseInt(sp.page ?? "1");

  const [stats, { total, items, totalPages }] = await Promise.all([
    getInscriptionStats(),
    listInscriptionApplications({
      search,
      status: statusFilter || undefined,
      page,
      pageSize: 20,
    }),
  ]);

  return (
    <AdminPageShell
      title="Dossiers d'inscription"
      description="Gestion des candidatures reçues en ligne"
      breadcrumbs={[{ label: "Inscriptions" }]}
    >
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <AdminStatCard label="Total" value={stats.total} icon={FileText} />
        <AdminStatCard label="En attente" value={stats.pending} icon={Clock} variant="warning" />
        <AdminStatCard label="En cours" value={stats.inReview} icon={Info} variant="ocean" />
        <AdminStatCard label="Acceptés" value={stats.accepted} icon={CheckCircle} variant="success" />
        <AdminStatCard label="Refusés" value={stats.rejected} icon={XCircle} />
      </div>

      {/* Filters */}
      <AdminPanel className="mb-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <input
            name="search"
            defaultValue={search}
            placeholder="Rechercher par code, CIN, nom…"
            className="flex h-9 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ocean-500 min-w-[200px]"
          />
          <select
            name="status"
            defaultValue={statusFilter}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <Button type="submit" size="sm">Filtrer</Button>
          {(search || statusFilter) && (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/admin/inscriptions">Réinitialiser</Link>
            </Button>
          )}
        </form>
      </AdminPanel>

      {/* Table */}
      <AdminPanel>
        <AdminTable>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Candidat</th>
              <th>CIN</th>
              <th>Tél.</th>
              <th>Niveau</th>
              <th>Filière</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  Aucun dossier trouvé
                </td>
              </tr>
            )}
            {items.map((app) => {
              const statusCfg = STATUS_LABELS[app.status];
              return (
                <tr key={app.id}>
                  <td className="font-mono text-xs font-bold text-ocean-700">{app.reference}</td>
                  <td className="font-medium">{app.prenom} {app.nom}</td>
                  <td className="font-mono text-xs">{app.cin}</td>
                  <td>{app.telephone}</td>
                  <td className="text-sm">{app.level.nameFr}</td>
                  <td className="text-sm">{app.filiere.nameFr}</td>
                  <td className="text-xs text-slate-500">{formatDate(app.submittedAt)}</td>
                  <td>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusCfg.className)}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/inscriptions/${app.id}`} className="gap-1">
                        <Eye className="h-3.5 w-3.5" /> Voir
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>{total} dossier(s)</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/inscriptions?page=${page - 1}&search=${search}&status=${statusFilter}`}>
                    Précédent
                  </Link>
                </Button>
              )}
              <span className="px-2 py-1">Page {page}/{totalPages}</span>
              {page < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/inscriptions?page=${page + 1}&search=${search}&status=${statusFilter}`}>
                    Suivant
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
