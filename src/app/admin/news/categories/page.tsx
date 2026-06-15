import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminCategories } from "@/services/news-admin.service";
import { NewsCategoriesManager } from "@/components/admin/news-categories-manager";
import { Button } from "@/components/ui/button";

export default async function AdminNewsCategoriesPage() {
  await requirePermission("news", "read");

  const categories = await listAdminCategories();

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/admin/news">
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles
        </Link>
      </Button>

      <h1 className="text-2xl font-bold text-navy-900">Catégories d&apos;actualités</h1>
      <p className="mt-1 text-sm text-slate-600">
        Organisez les articles par thème. Les slugs sont utilisés dans les filtres publics.
      </p>

      <div className="mt-8">
        <NewsCategoriesManager
          categories={categories.map((c) => ({
            id: c.id,
            slug: c.slug,
            nameFr: c.nameFr,
            nameAr: c.nameAr,
            order: c.order,
            articleCount: c._count.articles,
          }))}
        />
      </div>
    </div>
  );
}
