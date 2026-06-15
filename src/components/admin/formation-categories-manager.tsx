"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";
import {
  createFormationCategory,
  deleteFormationCategory,
  updateFormationCategory,
} from "@/actions/admin/formations.actions";
import type { FormationCategoryAdmin } from "@/services/formation-admin.service";
import { slugify } from "@/lib/utils";

interface FormationCategoriesManagerProps {
  categories: FormationCategoryAdmin[];
  canWrite: boolean;
}

export function FormationCategoriesManager({
  categories,
  canWrite,
}: FormationCategoriesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameFr, setNameFr] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [order, setOrder] = useState(categories.length);
  const [isPublished, setIsPublished] = useState(true);
  const [slugTouched, setSlugTouched] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setNameFr("");
    setNameAr("");
    setSlug("");
    setDescriptionFr("");
    setDescriptionAr("");
    setOrder(categories.length);
    setIsPublished(true);
    setSlugTouched(false);
  };

  const loadEdit = (cat: FormationCategoryAdmin) => {
    setEditingId(cat.id);
    setNameFr(cat.nameFr);
    setNameAr(cat.nameAr);
    setSlug(cat.slug);
    setDescriptionFr(cat.descriptionFr ?? "");
    setDescriptionAr(cat.descriptionAr ?? "");
    setOrder(cat.order);
    setIsPublished(cat.isPublished);
    setSlugTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    const payload = {
      nameFr,
      nameAr,
      slug: slug || slugify(nameFr),
      descriptionFr: descriptionFr.trim() || null,
      descriptionAr: descriptionAr.trim() || null,
      order,
      isPublished,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateFormationCategory({ id: editingId, ...payload })
        : await createFormationCategory(payload);

      if (result.success) {
        toast.success(editingId ? "Catégorie mise à jour" : "Catégorie créée");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!canWrite) return;
    if (!confirm("Supprimer cette catégorie ?")) return;
    startTransition(async () => {
      const result = await deleteFormationCategory(id);
      if (result.success) {
        toast.success("Catégorie supprimée");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle className="text-lg">Catégories ({categories.length})</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune catégorie — créez-en une pour ajouter des formations.</p>
          ) : (
            <ul className="divide-y">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{cat.nameFr}</p>
                    <p className="text-xs text-slate-500">
                      {cat.slug} · {cat.formationCount} formation(s)
                    </p>
                  </div>
                  {canWrite && (
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => loadEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cat.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </AdminCardContent>
      </AdminCard>

      {canWrite && (
        <AdminCard>
          <AdminCardHeader className="flex flex-row items-center justify-between">
            <AdminCardTitle className="text-lg">
              {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </AdminCardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Nouveau
            </Button>
          </AdminCardHeader>
          <AdminCardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom (FR) *</Label>
                <Input
                  value={nameFr}
                  onChange={(e) => {
                    setNameFr(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nom (AR) *</Label>
                <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="qualification"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (FR)</Label>
                <Textarea value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Description (AR)</Label>
                <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} rows={2} dir="rtl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordre</Label>
                  <Input
                    type="number"
                    min={0}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value) || 0)}
                  />
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  Publiée
                </label>
              </div>
              <Button type="submit" variant="ocean" disabled={isPending}>
                {editingId ? "Mettre à jour" : "Créer la catégorie"}
              </Button>
            </form>
          </AdminCardContent>
        </AdminCard>
      )}
    </div>
  );
}
