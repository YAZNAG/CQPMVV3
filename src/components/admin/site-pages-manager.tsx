"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, FileText, Pencil, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-panel";
import {
  createSitePage,
  deleteSitePage,
  updateSitePage,
} from "@/actions/admin/site-pages.actions";
import type { SitePageRecord } from "@/services/site-page.service";
import { sitePageHref } from "@/services/site-page.service";
import type { NavigationTreeItem } from "@/services/navigation.service";
import { slugify, cn } from "@/lib/utils";

const inputClass =
  "border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white focus-visible:ring-ocean-500/30";

const defaultForm = (items: SitePageRecord[]) => ({
  slug: "",
  titleFr: "",
  titleAr: "",
  excerptFr: "",
  excerptAr: "",
  contentFr: "<p></p>",
  contentAr: "<p></p>",
  coverImageUrl: "",
  isPublished: false,
  order: items.length,
  addToNavigation: true,
  navigationParentId: "",
});

interface SitePagesManagerProps {
  items: SitePageRecord[];
  navParents: NavigationTreeItem[];
  canWrite: boolean;
}

export function SitePagesManager({ items, navParents, canWrite }: SitePagesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState(() => defaultForm(items));

  const resetForm = () => {
    setEditingId(null);
    setSlugTouched(false);
    setForm(defaultForm(items));
  };

  const loadEdit = (item: SitePageRecord) => {
    setEditingId(item.id);
    setSlugTouched(true);
    setForm({
      slug: item.slug,
      titleFr: item.titleFr,
      titleAr: item.titleAr,
      excerptFr: item.excerptFr ?? "",
      excerptAr: item.excerptAr ?? "",
      contentFr: item.contentFr,
      contentAr: item.contentAr,
      coverImageUrl: item.coverImageUrl ?? "",
      isPublished: item.isPublished,
      order: item.order,
      addToNavigation: false,
      navigationParentId: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    const payload = {
      ...form,
      slug: form.slug || slugify(form.titleFr),
      coverImageUrl: form.coverImageUrl || null,
      excerptFr: form.excerptFr || null,
      excerptAr: form.excerptAr || null,
      navigationParentId: form.navigationParentId || null,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateSitePage({ id: editingId, ...payload })
        : await createSitePage(payload);

      if (result.success) {
        toast.success(editingId ? "Page mise à jour" : "Page créée");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!canWrite) return;
    if (!confirm("Supprimer cette page ?")) return;

    startTransition(async () => {
      const result = await deleteSitePage(id);
      if (result.success) {
        toast.success("Page supprimée");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <div className="grid gap-8 xl:grid-cols-5">
      <AdminPanel className="xl:col-span-2">
        <AdminPanelHeader
          icon={FileText}
          title={editingId ? "Modifier la page" : "Nouvelle page"}
          description="Créez une vraie page de contenu (FR/AR). Elle sera accessible sur /pages/votre-slug."
        />
        {canWrite ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="pageTitleFr">Titre (FR)</Label>
              <Input
                id="pageTitleFr"
                className={inputClass}
                value={form.titleFr}
                onChange={(e) => {
                  const titleFr = e.target.value;
                  setForm((f) => ({
                    ...f,
                    titleFr,
                    ...(!slugTouched ? { slug: slugify(titleFr) } : {}),
                  }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageTitleAr">Titre (AR)</Label>
              <Input
                id="pageTitleAr"
                className={cn(inputClass, "text-right")}
                dir="rtl"
                value={form.titleAr}
                onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageSlug">Slug URL</Label>
              <Input
                id="pageSlug"
                className={inputClass}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                }}
                placeholder="reglement-interieur"
                required
              />
              <p className="text-xs text-slate-500">
                URL publique : <code>/pages/{form.slug || "votre-slug"}</code>
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pageExcerptFr">Résumé (FR)</Label>
                <Textarea
                  id="pageExcerptFr"
                  className={inputClass}
                  rows={2}
                  value={form.excerptFr}
                  onChange={(e) => setForm((f) => ({ ...f, excerptFr: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageExcerptAr">Résumé (AR)</Label>
                <Textarea
                  id="pageExcerptAr"
                  className={cn(inputClass, "text-right")}
                  dir="rtl"
                  rows={2}
                  value={form.excerptAr}
                  onChange={(e) => setForm((f) => ({ ...f, excerptAr: e.target.value }))}
                />
              </div>
            </div>
            {form.coverImageUrl ? (
              <p className="truncate text-xs text-slate-500">{form.coverImageUrl}</p>
            ) : null}
            <AdminImageUpload
              folder="pages"
              onUploaded={(url) => {
                setForm((f) => ({ ...f, coverImageUrl: url }));
                toast.success("Image téléversée");
              }}
              onError={(msg) => toast.error(msg)}
            />
            <div className="space-y-2">
              <Label htmlFor="pageCoverUrl" className="text-xs text-slate-500">
                Ou URL / chemin image
              </Label>
              <Input
                id="pageCoverUrl"
                className={inputClass}
                value={form.coverImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                placeholder="/uploads/... ou /images/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Contenu (FR)</Label>
              <RichTextEditor
                value={form.contentFr}
                onChange={(contentFr) => setForm((f) => ({ ...f, contentFr }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Contenu (AR)</Label>
              <RichTextEditor
                value={form.contentAr}
                onChange={(contentAr) => setForm((f) => ({ ...f, contentAr }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pageOrder">Ordre</Label>
                <Input
                  id="pageOrder"
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: Number(e.target.value) }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 pt-8 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isPublished: e.target.checked }))
                  }
                />
                Publiée sur le site
              </label>
            </div>
            {form.isPublished && (
              <div className="rounded-lg border border-ocean-200/60 bg-ocean-50/40 p-4 space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
                  <input
                    type="checkbox"
                    checked={form.addToNavigation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, addToNavigation: e.target.checked }))
                    }
                  />
                  Ajouter au menu de navigation
                </label>
                {form.addToNavigation && (
                  <div className="space-y-2">
                    <Label htmlFor="pageNavParent">Menu parent (optionnel)</Label>
                    <select
                      id="pageNavParent"
                      value={form.navigationParentId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, navigationParentId: e.target.value }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Menu principal</option>
                      {navParents.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.labelFr}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <p className="text-xs text-slate-600">
                  Sinon, liez la page plus tard depuis{" "}
                  <Link href="/admin/navigation" className="text-ocean-700 underline">
                    Navigation
                  </Link>
                  .
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="ocean" disabled={isPending}>
                {editingId ? "Enregistrer" : "Créer la page"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500">Lecture seule.</p>
        )}
      </AdminPanel>

      <AdminPanel className="xl:col-span-3">
        <AdminPanelHeader
          icon={FileText}
          title="Pages du site"
          description={`${items.length} page(s) — contenu dynamique géré depuis le dashboard.`}
        />
        {items.length === 0 ? (
          <AdminEmptyState>
            <p className="font-medium text-navy-800">Aucune page</p>
            <p className="mt-2">
              Créez votre première page (ex. Règlement intérieur, Présentation, FAQ).
            </p>
          </AdminEmptyState>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between",
                  editingId === item.id && "rounded-lg bg-ocean-50/40 px-3"
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-navy-900">{item.titleFr}</p>
                    <span className="text-sm text-slate-500">({item.titleAr})</span>
                    <Badge variant={item.isPublished ? "ocean" : "secondary"}>
                      {item.isPublished ? "Publiée" : "Brouillon"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {sitePageHref(item.slug)}
                    {item.isPublished && (
                      <>
                        {" · "}
                        <Link
                          href={`/fr${sitePageHref(item.slug)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-ocean-700 hover:underline"
                        >
                          Voir
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                {canWrite && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => loadEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
