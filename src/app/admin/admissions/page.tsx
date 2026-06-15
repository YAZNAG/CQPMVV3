import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listApplications, getApplicationStats } from "@/services/application.service";
import {
  listAdminAdmissionFormFields,
  listAllFormationDocumentRequirements,
} from "@/services/admission-form.service";
import { prisma } from "@/lib/db";
import { ApplicationStatusBadge } from "@/components/admin/application-status-badge";
import { AdmissionAdminTabs, type AdmissionAdminTab } from "@/components/admin/admission-admin-tabs";
import { AdmissionFormManager } from "@/components/admin/admission-form-manager";
import { FormationDocumentsManager } from "@/components/admin/formation-documents-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApplicationStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { Eye, FileText } from "lucide-react";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPanel, AdminTable } from "@/components/admin/admin-panel";

const STATUS_FILTERS: { value: ApplicationStatus | ""; label: string }[] = [
  { value: "", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "ACCEPTED", label: "Acceptées" },
  { value: "WAITING_LIST", label: "Liste d'attente" },
  { value: "REJECTED", label: "Refusées" },
];

export default async function AdminAdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; tab?: string }>;
}) {
  const session = await requirePermission("admissions", "read");
  const canWrite = hasPermission(session.user.role, "admissions", "write");

  const { status, q, page: p, tab: rawTab } = await searchParams;
  const tab: AdmissionAdminTab =
    rawTab === "form" || rawTab === "documents" ? rawTab : "candidatures";
  const page = Number(p) || 1;
  const statusFilter =
    status && ["PENDING", "ACCEPTED", "REJECTED", "WAITING_LIST"].includes(status)
      ? (status as ApplicationStatus)
      : undefined;

  const [stats, result, formFields, docRequirements, formations] = await Promise.all([
    getApplicationStats(),
    listApplications({
      status: statusFilter,
      search: q,
      page,
      pageSize: 20,
    }),
    listAdminAdmissionFormFields(),
    listAllFormationDocumentRequirements(),
    prisma.formation.findMany({
      where: { deletedAt: null, isPublished: true },
      select: { id: true, titleFr: true },
      orderBy: { titleFr: "asc" },
    }),
  ]);

  return (
    <AdminPageShell
      title="Inscriptions"
      description="Candidatures, formulaire dynamique et pièces jointes par formation."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Inscriptions" },
      ]}
    >
      <AdmissionAdminTabs active={tab} pending={stats.pending} />

      {tab === "form" && (
        <AdmissionFormManager fields={formFields} canWrite={canWrite} />
      )}

      {tab === "documents" && (
        <FormationDocumentsManager
          formations={formations}
          requirements={docRequirements}
          canWrite={canWrite}
        />
      )}

      {tab === "candidatures" && (
        <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: stats.total, href: "/admin/admissions" },
          { label: "En attente", value: stats.pending, href: "/admin/admissions?status=PENDING" },
          { label: "Acceptées", value: stats.accepted, href: "/admin/admissions?status=ACCEPTED" },
          {
            label: "Liste d'attente",
            value: stats.waitingList,
            href: "/admin/admissions?status=WAITING_LIST",
          },
          { label: "Refusées", value: stats.rejected, href: "/admin/admissions?status=REJECTED" },
        ].map((s) => (
          <AdminStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            href={s.href}
            icon={FileText}
            variant={s.label === "En attente" && s.value > 0 ? "warning" : "default"}
          />
        ))}
      </div>

      <form className="mt-8 flex flex-wrap gap-3" method="get">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher (CIN, nom, réf., email)..."
          className="max-w-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value || "all"} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="ocean">
          Filtrer
        </Button>
        {(q || status) && (
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/admissions">Réinitialiser</Link>
          </Button>
        )}
      </form>

      <AdminPanel noPadding className="mt-6">
        <AdminTable>
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="p-4">Référence</th>
              <th className="p-4">Candidat</th>
              <th className="p-4">CIN</th>
              <th className="p-4">Formation</th>
              <th className="p-4">Date</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Aucune candidature trouvée
                </td>
              </tr>
            ) : (
              result.data.map((app) => (
                <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-xs">{app.referenceNumber}</td>
                  <td className="p-4 font-medium">
                    {app.firstName} {app.lastName}
                  </td>
                  <td className="p-4">{app.cin}</td>
                  <td className="p-4 max-w-[200px] truncate">{app.formation.titleFr}</td>
                  <td className="p-4 whitespace-nowrap text-slate-600">
                    {formatDate(app.createdAt, "fr-FR")}
                  </td>
                  <td className="p-4">
                    <ApplicationStatusBadge status={app.status} />
                  </td>
                  <td className="p-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/admissions/${app.id}`}>
                        <Eye className="h-4 w-4" />
                        Examiner
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminPanel>

      {result.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/admissions?page=${page - 1}${status ? `&status=${status}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              >
                Précédent
              </Link>
            </Button>
          )}
          <span className="text-sm text-slate-600">
            Page {page} / {result.totalPages} ({result.total} candidatures)
          </span>
          {page < result.totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/admissions?page=${page + 1}${status ? `&status=${status}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              >
                Suivant
              </Link>
            </Button>
          )}
        </div>
      )}
        </>
      )}
    </AdminPageShell>
  );
}