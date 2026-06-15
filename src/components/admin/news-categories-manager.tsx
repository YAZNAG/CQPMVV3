"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";
import {
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory,
} from "@/actions/admin/news.actions";
import { slugify } from "@/lib/utils";

export interface CategoryRow {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  order: number;
  articleCount: number;
}

interface NewsCategoriesManagerProps {
  categories: CategoryRow[];
}

export function NewsCategoriesManager({ categories }: NewsCategoriesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameFr, setNameFr] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState(0);
  const [slugTouched, setSlugTouched] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setNameFr("");
    setNameAr("");
    setSlug("");
    setOrder(categories.length);
    setSlugTouched(false);
  };

  const loadEdit = (cat: CategoryRow) => {
    setEditingId(cat.id);
    setNameFr(cat.nameFr);
    setNameAr(cat.nameAr);
    setSlug(cat.slug);
    setOrder(cat.order);
    setSlugTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nameFr,
      nameAr,
      slug: slug || slugify(nameFr),
      order,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateNewsCategory(editingId, payload)
        : await createNewsCategory(payload);

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
    if (!confirm("Supprimer cette catégorie ?")) return;
    startTransition(async () => {
      const result = await deleteNewsCategory(id);
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
          <AdminCardTitle className="text-lg">
            {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catNameFr">Nom (FR)</Label>
              <Input
                id="catNameFr"
                value={nameFr}
                onChange={(e) => {
                  setNameFr(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catNameAr">Nom (AR)</Label>
              <Input
                id="catNameAr"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                required
                dir="rtl"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catSlug">Slug URL</Label>
              <Input
                id="catSlug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catOrder">Ordre</Label>
              <Input
                id="catOrder"
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="ocean" disabled={isPending}>
                <Plus className="h-4 w-4" />
                {editingId ? "Enregistrer" : "Ajouter"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </AdminCardContent>
      </AdminCard>

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle className="text-lg">Catégories ({categories.length})</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <ul className="divide-y">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-navy-900">{cat.nameFr}</p>
                  <p className="text-xs text-slate-500">
                    /{cat.slug} · {cat.articleCount} article(s)
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => loadEdit(cat)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDelete(cat.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
