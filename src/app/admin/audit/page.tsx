import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { listAuditLogs } from "@/services/admin-dashboard.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminPanel, AdminTable } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { AuditAction } from "@prisma/client";

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  STATUS_CHANGE: "Statut",
  RESTORE: "Restauration",
};

const ACTION_OPTIONS = Object.keys(ACTION_LABELS) as AuditAction[];

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; entity?: string }>;
}) {
  await requirePermission("audit", "read");

  const { page: p, action, entity } = await searchParams;
  const page = Number(p) || 1;

  const result = await listAuditLogs({
    page,
    pageSize: 30,
    action: action || undefined,
    entity: entity || undefined,
  });

  return (
    <AdminPageShell
      title="Journal d'audit"
      description="Historique des actions sensibles sur la plateforme (connexions, modifications, suppressions)."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Audit" },
      ]}
    >
      <form className="mb-6 flex flex-wrap gap-3" method="get">
        <select
          name="action"
          defaultValue={action ?? ""}
          className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="">Toutes les actions</option>
          {ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]}
            </option>
          ))}
        </select>
        <input
          name="entity"
          defaultValue={entity ?? ""}
          placeholder="Entité (ex. Application)…"
          className="h-11 rounded-lg border border-slate-200 px-4 text-sm"
        />
        <Button type="submit" variant="ocean">
          Filtrer
        </Button>
        {(action || entity) && (
          <Button variant="outline" asChild>
            <Link href="/admin/audit">Réinitialiser</Link>
          </Button>
        )}
      </form>

      <AdminPanel noPadding>
        <AdminTable>
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Utilisateur</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Entité</th>
              <th className="px-6 py-3">ID</th>
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Aucun événement
                </td>
              </tr>
            ) : (
              result.data.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-6 py-3 text-slate-600">
                    {formatDate(log.createdAt, "fr-FR")}
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-medium text-slate-800">
                      {log.user?.name ?? log.user?.email ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {ACTION_LABELS[log.action]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-700">{log.entity}</td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-500">
                    {log.entityId?.slice(0, 12) ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminPanel>

      {result.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-4">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/audit?page=${page - 1}${action ? `&action=${action}` : ""}${entity ? `&entity=${encodeURIComponent(entity)}` : ""}`}
              >
                Précédent
              </Link>
            </Button>
          )}
          <span className="text-sm text-slate-600">
            {page} / {result.totalPages} ({result.total} entrées)
          </span>
          {page < result.totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/audit?page=${page + 1}${action ? `&action=${action}` : ""}${entity ? `&entity=${encodeURIComponent(entity)}` : ""}`}
              >
                Suivant
              </Link>
            </Button>
          )}
        </div>
      )}
    </AdminPageShell>
  );
}
