import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listAdminArticles, getNewsStats } from "@/services/news-admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Plus, Star, FolderOpen, Pencil } from "lucide-react";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import { getSiteSettings } from "@/services/site-settings.service";
import { isSiteSectionPublished } from "@/lib/site-section-publish";

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    status?: string;
  }>;
}) {
  const session = await requirePermission("news", "read");
  const canWrite = hasPermission(session.user.role, "news", "write");

  const { page: p, q, category, status } = await searchParams;
  const page = Number(p) || 1;
  const statusFilter =
    status === "published" || status === "draft" || status === "featured"
      ? status
      : "all";

  const [stats, result, settings] = await Promise.all([
    getNewsStats(),
    listAdminArticles({
      page,
      search: q,
      categoryId: category,
      status: statusFilter,
    }),
    getSiteSettings(),
  ]);

  return (
    <AdminPageShell
      title="Actualités"
      description="Articles, catégories, éditeur riche TipTap et publication."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Actualités" },
      ]}
      actions={
        canWrite ? (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/news/categories">
                <FolderOpen className="h-4 w-4" />
                Catégories
              </Link>
            </Button>
            <Button variant="ocean" size="sm" asChild>
              <Link href="/admin/news/new">
                <Plus className="h-4 w-4" />
                Nouvel article
              </Link>
            </Button>
          </>
        ) : undefined
      }
    >

      <div className="mt-8">
        <AdminSectionToggleBanner
          sectionKey="news"
          initialPublished={isSiteSectionPublished(settings, "news")}
          publishedCount={stats.published}
          totalCount={stats.total}
          itemLabel="article"
          locations="accueil & /news"
          canWrite={canWrite}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: stats.total, href: "/admin/news" },
          { label: "Publiés", value: stats.published, href: "/admin/news?status=published" },
          { label: "Brouillons", value: stats.draft, href: "/admin/news?status=draft" },
          { label: "À la une", value: stats.featured, href: "/admin/news?status=featured" },
          { label: "Catégories", value: stats.categories, href: "/admin/news/categories" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <form className="mt-8 flex flex-wrap gap-3" method="get">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher un article…"
          className="max-w-xs"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
          <option value="featured">À la une</option>
        </select>
        <Button type="submit" variant="ocean">
          Filtrer
        </Button>
        {(q || status) && (
          <Button variant="outline" asChild>
            <Link href="/admin/news">Réinitialiser</Link>
          </Button>
        )}
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Titre</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Date</th>
              <th className="p-4">Statut</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Aucun article
                </td>
              </tr>
            ) : (
              result.data.map((article) => (
                <tr key={article.id} className="border-b hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-medium line-clamp-1">{article.titleFr}</p>
                    {article.isFeatured && (
                      <span className="mt-1 inline-flex items-center gap-0.5 text-xs text-amber-600">
                        <Star className="h-3 w-3 fill-current" />
                        Vedette
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">
                    {article.category?.nameFr ?? "—"}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500">{article.slug}</td>
                  <td className="p-4 whitespace-nowrap text-slate-600">
                    {article.publishedAt
                      ? formatDate(article.publishedAt, "fr-FR")
                      : formatDate(article.createdAt, "fr-FR")}
                  </td>
                  <td className="p-4">
                    <Badge variant={article.isPublished ? "ocean" : "default"}>
                      {article.isPublished ? "Publié" : "Brouillon"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {canWrite && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/news/${article.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          Éditer
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-4">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/news?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${status ? `&status=${status}` : ""}`}
              >
                Précédent
              </Link>
            </Button>
          )}
          <span className="text-sm text-slate-600">
            {page} / {result.totalPages}
          </span>
          {page < result.totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/admin/news?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${status ? `&status=${status}` : ""}`}
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
