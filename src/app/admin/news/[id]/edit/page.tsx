import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminArticleById, listAdminCategories } from "@/services/news-admin.service";
import { NewsArticleForm } from "@/components/admin/news-article-form";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("news", "write");
  const { id } = await params;

  const [article, categories] = await Promise.all([
    getAdminArticleById(id),
    listAdminCategories(),
  ]);

  if (!article) notFound();

  return (
    <AdminPageShell
      title="Modifier l'article"
      description={article.titleFr}
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Actualités", href: "/admin/news" },
        { label: article.slug },
      ]}
    >
      <NewsArticleForm
        categories={categories.map((c) => ({
          id: c.id,
          nameFr: c.nameFr,
          slug: c.slug,
        }))}
        initial={{
          id: article.id,
          slug: article.slug,
          categoryId: article.categoryId,
          titleFr: article.titleFr,
          titleAr: article.titleAr,
          excerptFr: article.excerptFr,
          excerptAr: article.excerptAr,
          contentFr: article.contentFr,
          contentAr: article.contentAr,
          coverImageUrl: article.coverImageUrl,
          isFeatured: article.isFeatured,
          isPublished: article.isPublished,
          publishedAt: article.publishedAt?.toISOString() ?? null,
        }}
      />
    </AdminPageShell>
  );
}
