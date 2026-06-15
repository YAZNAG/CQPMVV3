import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminFormationCategories } from "@/services/formation-admin.service";
import { FormationForm } from "@/components/admin/formation-form";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";

export default async function AdminFormationNewPage() {
  await requirePermission("formations", "write");
  const categories = await listAdminFormationCategories();

  return (
    <AdminPageShell
      title="Nouvelle formation"
      description="Contenu bilingue, image, statut active/inactive et publication."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Formations", href: "/admin/formations" },
        { label: "Nouvelle" },
      ]}
    >
      {categories.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Créez d&apos;abord une{" "}
          <Link href="/admin/formations/categories" className="font-semibold underline">
            catégorie de formation
          </Link>{" "}
          avant d&apos;ajouter une formation.
        </div>
      ) : (
        <FormationForm
          categories={categories.map((c) => ({
            id: c.id,
            nameFr: c.nameFr,
            slug: c.slug,
          }))}
        />
      )}
    </AdminPageShell>
  );
}
