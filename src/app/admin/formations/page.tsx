import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminPanel, AdminTable } from "@/components/admin/admin-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Pencil } from "lucide-react";

export default async function AdminFormationsPage() {
  const session = await requirePermission("formations", "read");
  const canWrite = hasPermission(session.user.role, "formations", "write");

  const categories = await prisma.formationCategory.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    include: {
      formations: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
      },
    },
  });

  const totalFormations = categories.reduce((n, c) => n + c.formations.length, 0);
  const published = categories.reduce(
    (n, c) => n + c.formations.filter((f) => f.isPublished).length,
    0
  );

  return (
    <AdminPageShell
      title="Formations"
      description={`${totalFormations} formation(s) dans ${categories.length} catégorie(s) — ${published} publiée(s).`}
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Formations" },
      ]}
      actions={
        canWrite ? (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/formations/categories">
                <FolderOpen className="h-4 w-4" />
                Catégories
              </Link>
            </Button>
            <Button variant="ocean" size="sm" asChild>
              <Link href="/admin/formations/new">
                <Plus className="h-4 w-4" />
                Nouvelle formation
              </Link>
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="space-y-8">
        {categories.map((cat) => (
          <AdminPanel key={cat.id} noPadding>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">{cat.nameFr}</h2>
              <p className="text-xs font-mono text-slate-500">{cat.slug}</p>
            </div>
            {cat.formations.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-500">Aucune formation</p>
            ) : (
              <AdminTable>
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Titre</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Durée</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3">Public</th>
                    {canWrite && <th className="px-6 py-3" />}
                  </tr>
                </thead>
                <tbody>
                  {cat.formations.map((f) => (
                    <tr key={f.id} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-medium">{f.titleFr}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">{f.slug}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{f.durationFr}</td>
                      <td className="px-6 py-3">
                        <Badge
                          className={
                            f.isPublished
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }
                        >
                          {f.isPublished ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        {f.isPublished && (
                          <Link
                            href={`/fr/formations/${f.slug}`}
                            target="_blank"
                            className="text-sm text-ocean-600 hover:underline"
                          >
                            Voir
                          </Link>
                        )}
                      </td>
                      {canWrite && (
                        <td className="px-6 py-3">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/formations/${f.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              Éditer
                            </Link>
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            )}
          </AdminPanel>
        ))}
      </div>
    </AdminPageShell>
  );
}
