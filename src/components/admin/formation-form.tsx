"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CmsImage } from "@/components/public/cms-image";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AdminPanel } from "@/components/admin/admin-panel";
import {
  createFormation,
  deleteFormation,
  updateFormation,
} from "@/actions/admin/formations.actions";
import { resolveFormationImage } from "@/lib/site-images";
import { slugify, cn } from "@/lib/utils";
import { ExternalLink, ImageIcon, Trash2 } from "lucide-react";
import type { ActionResult } from "@/types";

const FIELD_LABELS: Record<string, string> = {
  titleFr: "Titre (FR)",
  titleAr: "Titre (AR)",
  descriptionFr: "Description (FR)",
  descriptionAr: "Description (AR)",
  objectivesFr: "Objectifs (FR)",
  objectivesAr: "Objectifs (AR)",
  requirementsFr: "Conditions d'admission (FR)",
  requirementsAr: "Conditions d'admission (AR)",
  durationFr: "Durée (FR)",
  durationAr: "Durée (AR)",
  categoryId: "Catégorie",
  slug: "Slug",
};

function showFormErrors(result: ActionResult<unknown>) {
  if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
    const summary = Object.entries(result.fieldErrors)
      .map(([key, messages]) => {
        const label = FIELD_LABELS[key] ?? key;
        return `${label}: ${messages[0]}`;
      })
      .join(" · ");
    toast.error(summary, { duration: 6000 });
    return result.fieldErrors;
  }
  toast.error(result.error ?? "Erreur");
  return undefined;
}

export interface FormationCategoryOption {
  id: string;
  nameFr: string;
  slug: string;
}

export interface FormationFormData {
  id?: string;
  categoryId: string;
  slug: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  objectivesFr: string;
  objectivesAr: string;
  durationFr: string;
  durationAr: string;
  requirementsFr: string;
  requirementsAr: string;
  imageUrl: string | null;
  order: number;
  isPublished: boolean;
}

interface FormationFormProps {
  categories: FormationCategoryOption[];
  initial?: FormationFormData;
}

export function FormationForm({ categories, initial }: FormationFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [isPending, startTransition] = useTransition();

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [titleFr, setTitleFr] = useState(initial?.titleFr ?? "");
  const [titleAr, setTitleAr] = useState(initial?.titleAr ?? "");
  const [descriptionFr, setDescriptionFr] = useState(initial?.descriptionFr ?? "");
  const [descriptionAr, setDescriptionAr] = useState(initial?.descriptionAr ?? "");
  const [objectivesFr, setObjectivesFr] = useState(initial?.objectivesFr ?? "");
  const [objectivesAr, setObjectivesAr] = useState(initial?.objectivesAr ?? "");
  const [durationFr, setDurationFr] = useState(initial?.durationFr ?? "");
  const [durationAr, setDurationAr] = useState(initial?.durationAr ?? "");
  const [requirementsFr, setRequirementsFr] = useState(initial?.requirementsFr ?? "");
  const [requirementsAr, setRequirementsAr] = useState(initial?.requirementsAr ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleTitleFrChange = (v: string) => {
    setTitleFr(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const buildPayload = () => ({
    categoryId,
    slug: slug || slugify(titleFr),
    titleFr,
    titleAr,
    descriptionFr,
    descriptionAr,
    objectivesFr,
    objectivesAr,
    durationFr,
    durationAr,
    requirementsFr,
    requirementsAr,
    imageUrl: imageUrl.trim() || null,
    order,
    isPublished,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Choisissez une catégorie");
      return;
    }

    startTransition(async () => {
      setFieldErrors({});
      const payload = buildPayload();
      const result = isEdit
        ? await updateFormation({ id: initial!.id!, ...payload })
        : await createFormation(payload);

      if (result.success) {
        toast.success(isEdit ? "Formation mise à jour" : "Formation créée");
        if (!isEdit && result.data && "id" in result.data) {
          router.push(`/admin/formations/${result.data.id}/edit`);
        } else {
          router.refresh();
        }
      } else {
        const errors = showFormErrors(result);
        if (errors) setFieldErrors(errors);
      }
    });
  };

  const handleDelete = () => {
    if (!initial?.id || !confirm("Supprimer cette formation ?")) return;
    startTransition(async () => {
      const result = await deleteFormation(initial.id!);
      if (result.success) {
        toast.success("Formation supprimée");
        router.push("/admin/formations");
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const previewSlug = slug || slugify(titleFr) || "formation";
  const previewImage = resolveFormationImage(imageUrl || null, previewSlug);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminPanel className="border-ocean-200/60 bg-gradient-to-r from-slate-50 to-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Statut sur le site public
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Badge
                className={cn(
                  "px-3 py-1 text-xs",
                  isPublished
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-700"
                )}
              >
                {isPublished ? "Active" : "Inactive"}
              </Badge>
              <p className="text-sm text-slate-600">
                {isPublished
                  ? "Visible sur le site et dans les listes publiques."
                  : "Masquée — brouillon, non visible par les visiteurs."}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setIsPublished(true)}
              className={cn(
                "rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
                isPublished
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setIsPublished(false)}
              className={cn(
                "rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
                !isPublished
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              Inactive
            </button>
          </div>
        </div>
      </AdminPanel>

      {Object.keys(fieldErrors).length > 0 && (
        <AdminPanel className="border-red-200 bg-red-50">
          <p className="text-sm font-semibold text-red-800">Corrigez les champs suivants :</p>
          <ul className="mt-2 list-inside list-disc text-sm text-red-700">
            {Object.entries(fieldErrors).map(([key, messages]) => (
              <li key={key}>
                {FIELD_LABELS[key] ?? key}: {messages[0]}
              </li>
            ))}
          </ul>
        </AdminPanel>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <LangPanel title="Français" accent="border-l-ocean-500">
            <Field label="Titre *" id="titleFr" value={titleFr} onChange={handleTitleFrChange} required error={fieldErrors.titleFr?.[0]} />
            <Field
              label="Description *"
              id="descriptionFr"
              value={descriptionFr}
              onChange={setDescriptionFr}
              textarea
              rows={4}
              required
              error={fieldErrors.descriptionFr?.[0]}
            />
            <Field
              label="Objectifs *"
              id="objectivesFr"
              value={objectivesFr}
              onChange={setObjectivesFr}
              textarea
              rows={4}
              required
              hint="Une ligne = une puce sur le site"
              error={fieldErrors.objectivesFr?.[0]}
            />
            <Field
              label="Conditions d'admission *"
              id="requirementsFr"
              value={requirementsFr}
              onChange={setRequirementsFr}
              textarea
              rows={4}
              required
              error={fieldErrors.requirementsFr?.[0]}
            />
            <Field
              label="Durée *"
              id="durationFr"
              value={durationFr}
              onChange={setDurationFr}
              placeholder="6 mois (résidentiel)"
              required
              error={fieldErrors.durationFr?.[0]}
            />
          </LangPanel>

          <LangPanel title="العربية" accent="border-l-navy-700" dir="rtl">
            <Field
              label="العنوان *"
              id="titleAr"
              value={titleAr}
              onChange={setTitleAr}
              required
              dir="rtl"
              error={fieldErrors.titleAr?.[0]}
            />
            <Field
              label="الوصف *"
              id="descriptionAr"
              value={descriptionAr}
              onChange={setDescriptionAr}
              textarea
              rows={4}
              required
              dir="rtl"
              error={fieldErrors.descriptionAr?.[0]}
            />
            <Field
              label="الأهداف *"
              id="objectivesAr"
              value={objectivesAr}
              onChange={setObjectivesAr}
              textarea
              rows={4}
              required
              dir="rtl"
              error={fieldErrors.objectivesAr?.[0]}
            />
            <Field
              label="شروط القبول *"
              id="requirementsAr"
              value={requirementsAr}
              onChange={setRequirementsAr}
              textarea
              rows={4}
              required
              dir="rtl"
              error={fieldErrors.requirementsAr?.[0]}
            />
            <Field
              label="المدة *"
              id="durationAr"
              value={durationAr}
              onChange={setDurationAr}
              required
              dir="rtl"
              error={fieldErrors.durationAr?.[0]}
            />
          </LangPanel>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <AdminPanel>
            <h3 className="text-sm font-semibold text-slate-900">Organisation</h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Catégorie *</Label>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/20"
                  required
                >
                  <option value="">— Choisir —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameFr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Ordre dans la catégorie</Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-slate-500">0 = en premier</p>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel>
            <h3 className="text-sm font-semibold text-slate-900">URL</h3>
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  required
                  className="font-mono text-sm"
                />
              </div>
              <p className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                /fr/formations/{previewSlug}
              </p>
              {isPublished && previewSlug && (
                <a
                  href={`/fr/formations/${previewSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ocean-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Voir sur le site
                </a>
              )}
            </div>
          </AdminPanel>

          <AdminPanel>
            <h3 className="text-sm font-semibold text-slate-900">Image de couverture</h3>
            <div className="mt-4 space-y-4">
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 border-dashed",
                  previewImage ? "border-transparent" : "border-slate-200 bg-slate-50"
                )}
              >
                {previewImage ? (
                  <div className="relative aspect-[4/3]">
                    <CmsImage src={previewImage} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageIcon className="h-10 w-10" strokeWidth={1.25} />
                    <p className="text-xs">Aucune image</p>
                  </div>
                )}
              </div>

              <AdminImageUpload
                folder="formations"
                onUploaded={(url) => {
                  setImageUrl(url);
                  toast.success("Image enregistrée");
                }}
                onError={(message) => toast.error(message)}
              />

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Ou coller une URL (optionnel)</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://… ou /images/…"
                  className="text-sm"
                />
              </div>

              {imageUrl && (
                <Button type="button" variant="outline" size="sm" onClick={() => setImageUrl("")}>
                  Retirer l&apos;image
                </Button>
              )}
            </div>
          </AdminPanel>
        </aside>
      </div>

      <AdminPanel className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50/50">
        <Button type="submit" variant="ocean" disabled={isPending} size="lg">
          {isPending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la formation"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/formations")}>
          Annuler
        </Button>
        <span className="hidden sm:inline text-sm text-slate-500">
          Statut :{" "}
          <strong className={isPublished ? "text-emerald-700" : "text-slate-600"}>
            {isPublished ? "Active" : "Inactive"}
          </strong>
        </span>
        {isEdit && (
          <Button
            type="button"
            variant="outline"
            className="ml-auto text-red-600 hover:border-red-200 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        )}
      </AdminPanel>
    </form>
  );
}

function LangPanel({
  title,
  accent,
  dir,
  children,
}: {
  title: string;
  accent: string;
  dir?: "rtl";
  children: React.ReactNode;
}) {
  return (
    <AdminPanel noPadding className="overflow-hidden">
      <div
        className={cn(
          "border-b border-slate-100 bg-slate-50/80 px-6 py-3",
          "border-l-4",
          accent
        )}
        dir={dir}
      >
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="space-y-4 p-6" dir={dir}>
        {children}
      </div>
    </AdminPanel>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  required,
  textarea,
  rows = 3,
  placeholder,
  hint,
  dir,
  error,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
  dir?: "rtl";
  error?: string;
}) {
  const invalid = !!error;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn("text-slate-700", invalid && "text-red-700")}>
        {label}
      </Label>
      {textarea ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          required={required}
          placeholder={placeholder}
          dir={dir}
          aria-invalid={invalid}
          className={cn(
            "resize-y border-slate-200 bg-white focus-visible:ring-ocean-400/30",
            dir === "rtl" && "text-right",
            invalid && "border-red-400 focus-visible:ring-red-400/30"
          )}
        />
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          dir={dir}
          aria-invalid={invalid}
          className={cn(
            "border-slate-200 bg-white focus-visible:ring-ocean-400/30",
            dir === "rtl" && "text-right",
            invalid && "border-red-400 focus-visible:ring-red-400/30"
          )}
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
