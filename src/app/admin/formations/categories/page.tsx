import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { listAdminFormationCategories } from "@/services/formation-admin.service";
import { FormationCategoriesManager } from "@/components/admin/formation-categories-manager";
import { Button } from "@/components/ui/button";

export default async function AdminFormationCategoriesPage() {
  const session = await requirePermission("formations", "read");
  const canWrite = hasPermission(session.user.role, "formations", "write");
  const categories = await listAdminFormationCategories();

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/admin/formations">
          <ArrowLeft className="h-4 w-4" />
          Retour aux formations
        </Link>
      </Button>

      <h1 className="text-2xl font-bold text-navy-900">Catégories de formations</h1>
      <p className="mt-1 text-sm text-slate-600">
        Qualification, Spécialisation, Formation continue…
      </p>

      <div className="mt-8">
        <FormationCategoriesManager categories={categories} canWrite={canWrite} />
      </div>
    </div>
  );
}
