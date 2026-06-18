import { requirePermission } from "@/lib/auth/guards";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPanel, AdminTable } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import {
  listInscriptionApplications,
  getInscriptionStats,
} from "@/services/inscription-admin.service";
import { cn } from "@/lib/utils";
import {
  FileText, Clock, CheckCircle, XCircle, Info, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type { InscriptionStatus } from "@prisma/client";
import {
  InscriptionsTableClient,
  type AppRow,
} from "@/components/admin/inscriptions-table-client";

const TABS: {
  label: string;
  status: InscriptionStatus | "";
  countKey: keyof Awaited<ReturnType<typeof getInscriptionStats>> | "total";
  icon: typeof Clock;
  activeClass: string;
}[] = [
  { label: "Tous", status: "", countKey: "total", icon: FileText, activeClass: "border-ocean-600 text-ocean-700 bg-ocean-50" },
  { label: "En attente", status: "PENDING", countKey: "pending", icon: Clock, activeClass: "border-amber-500 text-amber-700 bg-amber-50" },
  { label: "En cours d'étude", status: "IN_REVIEW", countKey: "inReview", icon: Info, activeClass: "border-blue-500 text-blue-700 bg-blue-50" },
  { label: "Acceptés", status: "ACCEPTED", countKey: "accepted", icon: CheckCircle, activeClass: "border-green-500 text-green-700 bg-green-50" },
  { label: "Refusés", status: "REJECTED", countKey: "rejected", icon: XCircle, activeClass: "border-red-500 text-red-700 bg-red-50" },
];

export default async function InscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requirePermission("admissions", "read");
  const sp = await searchParams;
  const search = sp.search ?? "";
  const statusFilter = (sp.status ?? "") as InscriptionStatus | "";
  const page = Math.max(1, parseInt(sp.page ?? "1"));

  const [stats, { total, items, totalPages }] = await Promise.all([
    getInscriptionStats(),
    listInscriptionApplications({
      search,
      status: statusFilter || undefined,
      page,
      pageSize: 20,
    }),
  ]);

  // Serialize for client component (no Date objects across server/client boundary)
  const rows: AppRow[] = items.map((app) => ({
    id: app.id,
    reference: app.reference,
    nom: app.nom,
    prenom: app.prenom,
    cin: app.cin,
    telephone: app.telephone,
    email: app.email,
    status: app.status,
    level: { nameFr: app.level.nameFr },
    filiere: { nameFr: app.filiere.nameFr },
    submittedAt: app.submittedAt.toISOString(),
    hasDocuments: (app._count?.documents ?? 0) > 0,
  }));

  const activeTab = TABS.find((t) => t.status === statusFilter) ?? TABS[0];

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

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 pb-0">
        {TABS.map((tab) => {
          const count = stats[tab.countKey as keyof typeof stats] as number;
          const isActive = tab.status === statusFilter;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.status}
              href={`/admin/inscriptions?status=${tab.status}&search=${search}`}
              className={cn(
                "flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? tab.activeClass
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                isActive ? "bg-white/70" : "bg-slate-100 text-slate-600"
              )}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <AdminPanel className="mb-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <input type="hidden" name="status" value={statusFilter} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Rechercher par code, CIN, nom, téléphone…"
            className="flex h-9 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ocean-500 min-w-[220px]"
          />
          <Button type="submit" size="sm">Rechercher</Button>
          {search && (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={`/admin/inscriptions?status=${statusFilter}`}>Effacer</Link>
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
              <th>Nom &amp; Prénom</th>
              <th>CIN</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Niveau</th>
              <th>Filière</th>
              <th>Date dépôt</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <InscriptionsTableClient items={rows} />
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
