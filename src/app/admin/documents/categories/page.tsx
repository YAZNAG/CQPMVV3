import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminDocumentCategories } from "@/services/document-admin.service";
import { DocumentCategoriesManager } from "@/components/admin/document-categories-manager";
import { Button } from "@/components/ui/button";

export default async function AdminDocumentCategoriesPage() {
  await requirePermission("pages", "read");

  const categories = await listAdminDocumentCategories();

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/admin/documents">
            <ArrowLeft className="h-4 w-4" />
            Retour aux documents
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-navy-900">Catégories de documents</h1>
        <p className="mt-1 text-sm text-slate-600">
          Organisez les documents par thème. Les slugs sont utilisés dans les filtres publics.
        </p>
      </div>

      <DocumentCategoriesManager categories={categories} />
    </div>
  );
}
