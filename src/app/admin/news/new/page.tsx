import { requirePermission } from "@/lib/auth/guards";
import { listAdminCategories } from "@/services/news-admin.service";
import { NewsArticleForm } from "@/components/admin/news-article-form";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";

export default async function AdminNewsNewPage() {
  await requirePermission("news", "write");

  const categories = await listAdminCategories();

  return (
    <AdminPageShell
      title="Nouvel article"
      description="Rédigez le contenu en français et en arabe, puis publiez ou mettez à la une."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Actualités", href: "/admin/news" },
        { label: "Nouveau" },
      ]}
    >
      <NewsArticleForm
        categories={categories.map((c) => ({
          id: c.id,
          nameFr: c.nameFr,
          slug: c.slug,
        }))}
      />
    </AdminPageShell>
  );
}
