import { requirePermission } from "@/lib/auth/guards";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminPanel, AdminTable } from "@/components/admin/admin-panel";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { EmailLogType, EmailLogStatus } from "@prisma/client";
import Link from "next/link";

const TYPE_LABELS: Record<EmailLogType, string> = {
  INSCRIPTION_SUBMITTED_ADMIN: "Nouvelle inscription → Admin",
  INSCRIPTION_SUBMITTED_CANDIDATE: "Confirmation → Candidat",
  INSCRIPTION_STATUS_CANDIDATE: "Statut → Candidat",
  CONTACT_ADMIN: "Contact → Admin",
  CONTACT_ACK: "Contact → Accusé visiteur",
  RECLAMATION_ADMIN: "Réclamation → Admin",
  RECLAMATION_ACK: "Réclamation → Accusé demandeur",
};

const TYPE_COLORS: Record<EmailLogType, string> = {
  INSCRIPTION_SUBMITTED_ADMIN: "bg-blue-100 text-blue-800",
  INSCRIPTION_SUBMITTED_CANDIDATE: "bg-teal-100 text-teal-800",
  INSCRIPTION_STATUS_CANDIDATE: "bg-purple-100 text-purple-800",
  CONTACT_ADMIN: "bg-slate-100 text-slate-700",
  CONTACT_ACK: "bg-slate-100 text-slate-700",
  RECLAMATION_ADMIN: "bg-amber-100 text-amber-800",
  RECLAMATION_ACK: "bg-amber-100 text-amber-800",
};

const STATUS_CFG: Record<EmailLogStatus, { label: string; className: string }> = {
  SENT: { label: "Envoyé", className: "bg-green-100 text-green-800" },
  FAILED: { label: "Échoué", className: "bg-red-100 text-red-800" },
};

export default async function EmailLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requirePermission("settings", "read");
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const statusFilter = (sp.status ?? "") as EmailLogStatus | "";
  const PAGE_SIZE = 30;

  const where = statusFilter ? { status: statusFilter } : {};

  const [total, items, stats] = await Promise.all([
    prisma.emailLog.count({ where }),
    prisma.emailLog.findMany({
      where,
      orderBy: { sentAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.emailLog.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const sent = stats.find((s) => s.status === "SENT")?._count ?? 0;
  const failed = stats.find((s) => s.status === "FAILED")?._count ?? 0;

  return (
    <AdminPageShell
      title="Journal des emails"
      description="Historique des notifications envoyées par le système"
      breadcrumbs={[{ label: "Paramètres", href: "/admin/settings" }, { label: "Journal emails" }]}
    >
      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-900">{total}</p>
          <p className="text-xs text-slate-500 mt-1">Total emails</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-700">{sent}</p>
          <p className="text-xs text-green-600 mt-1">Envoyés</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-700">{failed}</p>
          <p className="text-xs text-red-600 mt-1">Échoués</p>
        </div>
      </div>

      {/* Filter */}
      <AdminPanel className="mb-4">
        <form method="GET" className="flex gap-3">
          <select
            name="status"
            defaultValue={statusFilter}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="SENT">Envoyés</option>
            <option value="FAILED">Échoués</option>
          </select>
          <button type="submit" className="h-9 px-4 bg-ocean-600 text-white text-sm rounded-md font-medium hover:bg-ocean-700">
            Filtrer
          </button>
          {statusFilter && (
            <Link href="/admin/emails" className="h-9 px-4 border border-slate-200 text-sm rounded-md font-medium flex items-center hover:bg-slate-50">
              Réinitialiser
            </Link>
          )}
        </form>
      </AdminPanel>

      {/* Table */}
      <AdminPanel>
        <AdminTable>
          <thead>
            <tr>
              <th>Type</th>
              <th>Destinataire</th>
              <th>Sujet</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Erreur</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">Aucun email enregistré</td>
              </tr>
            )}
            {items.map((log) => {
              const statusCfg = STATUS_CFG[log.status];
              return (
                <tr key={log.id}>
                  <td>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", TYPE_COLORS[log.type])}>
                      {TYPE_LABELS[log.type]}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-slate-600">{log.recipient}</td>
                  <td className="text-xs text-slate-700 max-w-[220px] truncate">{log.subject}</td>
                  <td>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusCfg.className)}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.sentAt).toLocaleString("fr-MA", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="max-w-[180px]">
                    {log.errorMessage && (
                      <span className="text-[11px] text-red-600 truncate block" title={log.errorMessage}>
                        {log.errorMessage.slice(0, 80)}…
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>{total} email(s)</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/emails?page=${page - 1}&status=${statusFilter}`}
                  className="px-3 py-1 border border-slate-200 rounded text-sm hover:bg-slate-50">
                  Précédent
                </Link>
              )}
              <span className="px-2 py-1">Page {page}/{totalPages}</span>
              {page < totalPages && (
                <Link href={`/admin/emails?page=${page + 1}&status=${statusFilter}`}
                  className="px-3 py-1 border border-slate-200 rounded text-sm hover:bg-slate-50">
                  Suivant
                </Link>
              )}
            </div>
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
