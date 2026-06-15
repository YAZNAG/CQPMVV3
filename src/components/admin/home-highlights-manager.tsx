"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import {
  createHomeHighlight,
  deleteHomeHighlight,
  updateHomeHighlight,
} from "@/actions/admin/home-highlights.actions";
import type { HomeHighlightIcon } from "@prisma/client";
import type { HomeHighlightRecord } from "@/services/home-highlight.service";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  { value: "ANCHOR", label: "Ancre" },
  { value: "SHIP", label: "Bateau" },
  { value: "USER", label: "Personne / capitaine" },
  { value: "BUILDING", label: "Bâtiment" },
  { value: "AWARD", label: "Médaille" },
] as const;

const defaultForm = (items: HomeHighlightRecord[]) => ({
  titleFr: "",
  titleAr: "",
  subtitleFr: "",
  subtitleAr: "",
  backgroundColor: "#2563eb",
  imageUrl: "",
  icon: "ANCHOR" as HomeHighlightIcon,
  href: "",
  order: items.length,
  isPublished: true,
});

interface HomeHighlightsManagerProps {
  items: HomeHighlightRecord[];
  sectionPublished: boolean;
  canWrite: boolean;
}

export function HomeHighlightsManager({ items, sectionPublished, canWrite }: HomeHighlightsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultForm(items));

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm(items));
  };

  const loadEdit = (item: HomeHighlightRecord) => {
    setEditingId(item.id);
    setForm({
      titleFr: item.titleFr,
      titleAr: item.titleAr,
      subtitleFr: item.subtitleFr,
      subtitleAr: item.subtitleAr,
      backgroundColor: item.backgroundColor,
      imageUrl: item.imageUrl ?? "",
      icon: item.icon,
      href: item.href ?? "",
      order: item.order,
      isPublished: item.isPublished,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    const payload = {
      ...form,
      imageUrl: form.imageUrl.trim() || null,
      href: form.href.trim() || null,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateHomeHighlight({ id: editingId, ...payload })
        : await createHomeHighlight(payload);

      if (result.success) {
        toast.success(editingId ? "Carte mise à jour" : "Carte créée");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!canWrite) return;
    if (!confirm("Supprimer cette carte ?")) return;

    startTransition(async () => {
      const result = await deleteHomeHighlight(id);
      if (result.success) {
        toast.success("Carte supprimée");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const publishedCount = items.filter((i) => i.isPublished).length;

  return (
    <div className="space-y-8">
      <AdminSectionToggleBanner
        sectionKey="highlights"
        initialPublished={sectionPublished}
        publishedCount={publishedCount}
        totalCount={items.length}
        itemLabel="carte"
        locations="accueil (sous le hero)"
        canWrite={canWrite}
      />

      <div className="grid gap-8 xl:grid-cols-5">
        <AdminCard className="xl:col-span-3">
          <AdminCardHeader className="flex flex-row items-center justify-between">
            <AdminCardTitle className="text-lg">Cartes ({items.length})</AdminCardTitle>
            {canWrite && (
              <Button type="button" variant="ocean" size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Nouvelle carte
              </Button>
            )}
          </AdminCardHeader>
          <AdminCardContent>
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune carte configurée.</p>
            ) : (
              <ul className="divide-y">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between gap-4 py-4",
                      editingId === item.id && "rounded-lg bg-ocean-50/40 px-3"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span
                        className="h-12 w-12 shrink-0 rounded-lg ring-1 ring-slate-200"
                        style={{ backgroundColor: item.backgroundColor }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-navy-900">{item.titleFr}</p>
                        <p className="text-sm text-slate-600">{item.subtitleFr}</p>
                        <p className="text-xs text-slate-500">Ordre {item.order}</p>
                      </div>
                    </div>
                    {canWrite && (
                      <div className="flex shrink-0 gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => loadEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(item.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
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
          <AdminCard className="xl:col-span-2">
            <AdminCardHeader>
              <AdminCardTitle className="text-lg">
                {editingId ? "Modifier la carte" : "Nouvelle carte"}
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hlTitleFr">Titre (FR)</Label>
                  <Input
                    id="hlTitleFr"
                    value={form.titleFr}
                    onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hlTitleAr">Titre (AR)</Label>
                  <Input
                    id="hlTitleAr"
                    value={form.titleAr}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                    required
                    dir="rtl"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hlSubtitleFr">Sous-titre (FR)</Label>
                  <Input
                    id="hlSubtitleFr"
                    value={form.subtitleFr}
                    onChange={(e) => setForm({ ...form, subtitleFr: e.target.value })}
                    placeholder="140 candidats / année"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hlSubtitleAr">Sous-titre (AR)</Label>
                  <Input
                    id="hlSubtitleAr"
                    value={form.subtitleAr}
                    onChange={(e) => setForm({ ...form, subtitleAr: e.target.value })}
                    required
                    dir="rtl"
                    className="text-right"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hlColor">Couleur fond</Label>
                    <Input
                      id="hlColor"
                      type="color"
                      value={form.backgroundColor}
                      onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                      className="h-10 cursor-pointer p-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hlOrder">Ordre</Label>
                    <Input
                      id="hlOrder"
                      type="number"
                      min={0}
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Image fond (optionnel)</Label>
                  {form.imageUrl ? (
                    <div
                      className="relative aspect-[16/9] overflow-hidden rounded-xl border border-slate-200"
                      style={{ backgroundColor: form.backgroundColor }}
                    >
                      <Image
                        src={form.imageUrl}
                        alt=""
                        fill
                        className="object-cover opacity-80"
                        unoptimized={form.imageUrl.startsWith("/uploads/")}
                      />
                    </div>
                  ) : null}
                  <AdminImageUpload
                    folder="highlights"
                    onUploaded={(url) => {
                      setForm({ ...form, imageUrl: url });
                      toast.success("Image téléversée");
                    }}
                    onError={(msg) => toast.error(msg)}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="hlImage" className="text-xs text-slate-500">
                      Ou coller une URL / chemin
                    </Label>
                    <Input
                      id="hlImage"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="/images/formation-fishing.jpg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hlIcon">Icône</Label>
                  <select
                    id="hlIcon"
                    value={form.icon}
                    onChange={(e) =>
                      setForm({ ...form, icon: e.target.value as typeof form.icon })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hlHref">Lien (optionnel)</Label>
                  <Input
                    id="hlHref"
                    value={form.href}
                    onChange={(e) => setForm({ ...form, href: e.target.value })}
                    placeholder="/about"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  />
                  Publié
                </label>
                <div className="flex gap-2">
                  <Button type="submit" variant="ocean" disabled={isPending}>
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
        )}
      </div>
    </div>
  );
}
