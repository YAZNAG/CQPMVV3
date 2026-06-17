import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listAdminDocuments, listAdminDocumentCategories, getAdminDocumentStats } from "@/services/document-admin.service";
import { DocumentsManager } from "@/components/admin/documents-manager";
import { Button } from "@/components/ui/button";

export default async function AdminDocumentsPage() {
  const session = await requirePermission("pages", "read");
  const canWrite = hasPermission(session.user.role, "pages", "write");

  const [{ rows }, categories, stats] = await Promise.all([
    listAdminDocuments(),
    listAdminDocumentCategories(),
    getAdminDocumentStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Espace Téléchargement — Documents</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gérez les documents publiés dans la section Téléchargements du site.
          </p>
        </div>
        {canWrite && (
          <Button variant="outline" asChild>
            <Link href="/admin/documents/categories">
              <FolderOpen className="h-4 w-4" />
              Catégories
            </Link>
          </Button>
        )}
      </div>

      {canWrite ? (
        <DocumentsManager documents={rows} categories={categories} stats={stats} />
      ) : (
        <p className="text-sm text-slate-500">Lecture seule.</p>
      )}
    </div>
  );
}
