"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/admin-panel";
import {
  createDocumentCategory,
  updateDocumentCategory,
  deleteDocumentCategory,
} from "@/actions/admin/document.actions";
import { slugify } from "@/lib/utils";
import type { DocumentCategoryAdminRow } from "@/services/document-admin.service";

interface Props {
  categories: DocumentCategoryAdminRow[];
}

export function DocumentCategoriesManager({ categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameFr, setNameFr] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [slugTouched, setSlugTouched] = useState(false);

  const reset = () => {
    setEditingId(null);
    setNameFr("");
    setNameAr("");
    setSlug("");
    setDescriptionFr("");
    setDescriptionAr("");
    setIsActive(true);
    setSortOrder(categories.length);
    setSlugTouched(false);
  };

  const loadEdit = (c: DocumentCategoryAdminRow) => {
    setEditingId(c.id);
    setNameFr(c.nameFr);
    setNameAr(c.nameAr);
    setSlug(c.slug);
    setDescriptionFr(c.descriptionFr ?? "");
    setDescriptionAr(c.descriptionAr ?? "");
    setIsActive(c.isActive);
    setSortOrder(c.sortOrder);
    setSlugTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nameFr,
      nameAr,
      slug: slug || slugify(nameFr),
      descriptionFr: descriptionFr || null,
      descriptionAr: descriptionAr || null,
      isActive,
      sortOrder,
      ...(editingId ? { id: editingId } : {}),
    };

    startTransition(async () => {
      const result = editingId
        ? await updateDocumentCategory(payload)
        : await createDocumentCategory(payload);

      if (result.success) {
        toast.success(editingId ? "Catégorie mise à jour" : "Catégorie créée");
        reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string, count: number) => {
    if (count > 0) {
      toast.error(`Cette catégorie contient ${count} document(s). Supprimez-les d'abord.`);
      return;
    }
    if (!confirm("Supprimer cette catégorie ?")) return;
    startTransition(async () => {
      const result = await deleteDocumentCategory(id);
      if (result.success) {
        toast.success("Catégorie supprimée");
        if (editingId === id) reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle className="text-lg">
            {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catNameFr">Nom (FR) *</Label>
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
              <Label htmlFor="catNameAr">Nom (AR) *</Label>
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
                placeholder="ex: formulaires-admission"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDescFr">Description (FR)</Label>
              <Textarea
                id="catDescFr"
                value={descriptionFr}
                onChange={(e) => setDescriptionFr(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDescAr">Description (AR)</Label>
              <Textarea
                id="catDescAr"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                rows={2}
                dir="rtl"
                className="text-right"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="catOrder">Ordre</Label>
                <Input
                  id="catOrder"
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end pb-1">
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-slate-400" />
                  )}
                  {isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="ocean" disabled={isPending}>
                <Plus className="h-4 w-4" />
                {editingId ? "Enregistrer" : "Ajouter"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={reset}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </AdminCardContent>
      </AdminCard>

      {/* List */}
      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle className="text-lg">
            Catégories ({categories.length})
          </AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune catégorie créée.</p>
          ) : (
            <ul className="divide-y">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-navy-900">{cat.nameFr}</p>
                      <Badge variant="default" className={`shrink-0 text-xs ${cat.isActive ? "" : "bg-slate-100 text-slate-500"}`}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      /{cat.slug} · {cat.documentCount} document(s)
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => loadEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(cat.id, cat.documentCount)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
