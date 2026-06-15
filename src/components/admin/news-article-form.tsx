"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ExternalLink,
  Globe,
  ImageIcon,
  Languages,
  Newspaper,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { CmsImage } from "@/components/public/cms-image";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminField,
  AdminFormFooter,
  AdminSelect,
  AdminTextField,
} from "@/components/admin/admin-form-fields";
import {
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-panel";
import {
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
} from "@/actions/admin/news.actions";
import { slugify, cn } from "@/lib/utils";
import type { ActionResult } from "@/types";

const FIELD_LABELS: Record<string, string> = {
  titleFr: "Titre (FR)",
  titleAr: "Titre (AR)",
  excerptFr: "Extrait (FR)",
  excerptAr: "Extrait (AR)",
  contentFr: "Corps (FR)",
  contentAr: "Corps (AR)",
  slug: "Slug",
  categoryId: "Catégorie",
  coverImageUrl: "Image de couverture",
};

function showFormErrors(result: ActionResult<unknown>) {
  if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
    const summary = Object.entries(result.fieldErrors)
      .map(([key, messages]) => {
        const label = FIELD_LABELS[key] ?? key;
        return `${label}: ${messages[0]}`;
      })
      .join(" · ");
    toast.error(summary, { duration: 8000 });
    return result.fieldErrors;
  }
  toast.error(result.error ?? "Erreur");
  return undefined;
}

export interface NewsCategoryOption {
  id: string;
  nameFr: string;
  slug: string;
}

export interface NewsArticleFormData {
  id?: string;
  slug: string;
  categoryId: string | null;
  titleFr: string;
  titleAr: string;
  excerptFr: string;
  excerptAr: string;
  contentFr: string;
  contentAr: string;
  coverImageUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

interface NewsArticleFormProps {
  categories: NewsCategoryOption[];
  initial?: NewsArticleFormData;
}

const inputClass =
  "border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white focus-visible:ring-ocean-500/30";

function ToggleOption({
  checked,
  onChange,
  label,
  icon: Icon,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
        checked
          ? "border-ocean-200 bg-ocean-50/60"
          : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 rounded border-slate-300 text-ocean-600 focus:ring-ocean-500"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-ocean-600" />}
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
        )}
      </span>
    </label>
  );
}

export function NewsArticleForm({ categories, initial }: NewsArticleFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [isPending, startTransition] = useTransition();

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [titleFr, setTitleFr] = useState(initial?.titleFr ?? "");
  const [titleAr, setTitleAr] = useState(initial?.titleAr ?? "");
  const [excerptFr, setExcerptFr] = useState(initial?.excerptFr ?? "");
  const [excerptAr, setExcerptAr] = useState(initial?.excerptAr ?? "");
  const [contentFr, setContentFr] = useState(initial?.contentFr ?? "<p></p>");
  const [contentAr, setContentAr] = useState(initial?.contentAr ?? "<p></p>");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt
      ? new Date(initial.publishedAt).toISOString().slice(0, 16)
      : ""
  );

  const handleTitleFrChange = (v: string) => {
    setTitleFr(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const buildPayload = () => ({
    slug: slug || slugify(titleFr),
    categoryId: categoryId || null,
    titleFr,
    titleAr,
    excerptFr,
    excerptAr,
    contentFr,
    contentAr,
    coverImageUrl: coverImageUrl || null,
    isFeatured,
    isPublished,
    publishedAt: publishedAt || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = buildPayload();
      const result = isEdit
        ? await updateNewsArticle(initial!.id!, payload)
        : await createNewsArticle(payload);

      if (result.success) {
        toast.success(isEdit ? "Article mis à jour" : "Article créé");
        if (!isEdit && result.data && "id" in result.data) {
          router.push(`/admin/news/${result.data.id}/edit`);
        } else {
          router.refresh();
        }
      } else {
        showFormErrors(result);
      }
    });
  };

  const handleDelete = () => {
    if (!initial?.id || !confirm("Supprimer cet article ?")) return;
    startTransition(async () => {
      const result = await deleteNewsArticle(initial.id!);
      if (result.success) {
        toast.success("Article supprimé");
        router.push("/admin/news");
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const previewSlug = slug || slugify(titleFr) || "article";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <AdminPanel>
            <AdminPanelHeader
              icon={Languages}
              title="Contenu français"
              description="Titre, extrait et corps de l'article en français."
            />
            <div className="space-y-5">
              <AdminField
                label="Titre (FR)"
                value={titleFr}
                onChange={handleTitleFrChange}
                required
              />
              <AdminTextField
                label="Extrait (FR)"
                value={excerptFr}
                onChange={setExcerptFr}
                rows={3}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Corps (FR)
                </p>
                <div className="mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <RichTextEditor
                    value={contentFr}
                    onChange={setContentFr}
                    minHeight="280px"
                  />
                </div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              icon={Languages}
              title="Contenu arabe"
              description="العنوان والمقتطف والمحتوى بالعربية."
            />
            <div className="space-y-5" dir="rtl">
              <AdminField
                label="العنوان (AR)"
                value={titleAr}
                onChange={setTitleAr}
                dir="rtl"
                required
              />
              <AdminTextField
                label="المقتطف (AR)"
                value={excerptAr}
                onChange={setExcerptAr}
                dir="rtl"
                rows={3}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  المحتوى (AR)
                </p>
                <div className="mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <RichTextEditor
                    value={contentAr}
                    onChange={setContentAr}
                    minHeight="280px"
                    placeholder="اكتب المحتوى…"
                  />
                </div>
              </div>
            </div>
          </AdminPanel>
        </div>

        <div className="space-y-8">
          <AdminPanel>
            <AdminPanelHeader
              icon={Send}
              title="Publication"
              description="Visibilité sur le site et page d'accueil."
            />
            <div className="space-y-3">
              <ToggleOption
                checked={isPublished}
                onChange={setIsPublished}
                label="Publié"
                description="Visible sur /fr/news et l'accueil si à la une."
              />
              <ToggleOption
                checked={isFeatured}
                onChange={setIsFeatured}
                label="À la une"
                icon={Star}
                description="Affiché dans la section Actualités de l'accueil."
              />
              {isPublished && (
                <div className="pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date de publication
                  </p>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className={cn("mt-1.5", inputClass)}
                  />
                </div>
              )}
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              icon={Globe}
              title="SEO & URL"
              description="Adresse de l'article et catégorie."
            />
            <div className="space-y-5">
              <AdminField
                label="Slug (URL)"
                value={slug}
                onChange={(v) => {
                  setSlugTouched(true);
                  setSlug(v);
                }}
                hint={`/fr/news/${previewSlug}`}
              />
              {isPublished && (
                <a
                  href={`/fr/news/${previewSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ocean-600 hover:text-ocean-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Aperçu public
                </a>
              )}
              <AdminSelect
                id="category"
                label="Catégorie"
                value={categoryId}
                onChange={setCategoryId}
              >
                <option value="">— Aucune —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameFr}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminPanelHeader
              icon={ImageIcon}
              title="Image de couverture"
              description="Photo affichée sur les cartes actualités."
            />
            <div className="space-y-4">
              {coverImageUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <CmsImage src={coverImageUrl} alt="" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80">
                  <Newspaper className="h-10 w-10 text-slate-300" aria-hidden />
                </div>
              )}
              <AdminImageUpload
                folder="news"
                onUploaded={(url) => {
                  setCoverImageUrl(url);
                  toast.success("Image téléversée");
                }}
                onError={(msg) => toast.error(msg)}
              />
              <AdminField
                label="Ou coller un lien"
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                placeholder="https://… ou /uploads/news/…"
                hint="URL complète ou chemin local commençant par /"
              />
              {coverImageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-200"
                  onClick={() => setCoverImageUrl("")}
                >
                  Retirer l&apos;image
                </Button>
              )}
            </div>
          </AdminPanel>
        </div>
      </div>

      <AdminPanel className="sticky bottom-4 z-10 border-ocean-100/80 bg-white/95 backdrop-blur-sm">
        <AdminFormFooter className="mt-0 border-0 pt-0">
          <Button type="submit" variant="ocean" disabled={isPending}>
            {isPending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer l'article"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-slate-200"
            onClick={() => router.push("/admin/news")}
          >
            Annuler
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              className="ml-auto border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          )}
        </AdminFormFooter>
      </AdminPanel>
    </form>
  );
}
