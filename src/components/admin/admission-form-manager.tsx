"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  FormInput,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AdminBilingualGrid,
  AdminField,
  AdminFormFooter,
  AdminTextField,
} from "@/components/admin/admin-form-fields";
import {
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-panel";
import {
  createAdmissionFormField,
  deleteAdmissionFormField,
  updateAdmissionFormField,
} from "@/actions/admin/admission-form.actions";
import {
  ADMISSION_FIELD_TYPES,
  type AdmissionFieldType,
} from "@/lib/validations/admission-form";
import type { AdmissionFormFieldRecord } from "@/services/admission-form.service";
import { cn, slugify } from "@/lib/utils";

const TYPE_LABELS: Record<AdmissionFieldType, string> = {
  TEXT: "Texte",
  EMAIL: "Email",
  TEL: "Téléphone",
  NUMBER: "Nombre",
  TEXTAREA: "Zone de texte",
  DATE: "Date",
  SELECT: "Liste déroulante",
  RADIO: "Boutons radio",
  CHECKBOX: "Case à cocher",
  CHECKBOX_GROUP: "Cases multiples",
  GENDER_SELECT: "Sexe",
  FORMATION_SELECT: "Formation",
  HEADING: "Titre",
  PARAGRAPH: "Paragraphe",
  DIVIDER: "Séparateur",
  SUBMIT_BUTTON: "Bouton envoyer",
};

const OPTION_TYPES = new Set<AdmissionFieldType>([
  "SELECT",
  "RADIO",
  "CHECKBOX_GROUP",
]);

const CONTENT_TYPES: AdmissionFieldType[] = [
  "HEADING",
  "PARAGRAPH",
  "DIVIDER",
  "SUBMIT_BUTTON",
];

const defaultForm = (fields: AdmissionFormFieldRecord[]) => ({
  key: "",
  type: "TEXT" as AdmissionFieldType,
  labelFr: "",
  labelAr: "",
  placeholderFr: "",
  placeholderAr: "",
  helpTextFr: "",
  helpTextAr: "",
  optionsText: "",
  defaultValue: "",
  isRequired: false,
  width: "full" as "full" | "half",
  order: fields.length,
  isPublished: true,
  buttonStyle: "ocean" as "ocean" | "outline" | "navy",
});

function parseOptions(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, labelFr, labelAr] = line.split("|").map((p) => p.trim());
      return {
        value: value || slugify(labelFr || "option"),
        labelFr: labelFr || value,
        labelAr: labelAr || labelFr || value,
      };
    });
}

function formatOptions(options: AdmissionFormFieldRecord["options"]) {
  if (!options?.length) return "";
  return options.map((o) => `${o.value}|${o.labelFr}|${o.labelAr}`).join("\n");
}

interface AdmissionFormManagerProps {
  fields: AdmissionFormFieldRecord[];
  canWrite: boolean;
}

export function AdmissionFormManager({
  fields,
  canWrite,
}: AdmissionFormManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultForm(fields));
  const [keyTouched, setKeyTouched] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setKeyTouched(false);
    setForm(defaultForm(fields));
  };

  const loadField = (field: AdmissionFormFieldRecord) => {
    setEditingId(field.id);
    setKeyTouched(true);
    setForm({
      key: field.key,
      type: field.type,
      labelFr: field.labelFr,
      labelAr: field.labelAr,
      placeholderFr: field.placeholderFr ?? "",
      placeholderAr: field.placeholderAr ?? "",
      helpTextFr: field.helpTextFr ?? "",
      helpTextAr: field.helpTextAr ?? "",
      optionsText: formatOptions(field.options),
      defaultValue: field.defaultValue ?? "",
      isRequired: field.isRequired,
      width: field.width === "half" ? "half" : "full",
      order: field.order,
      isPublished: field.isPublished,
      buttonStyle:
        (field.buttonStyle as "ocean" | "outline" | "navy") ?? "ocean",
    });
  };

  const buildPayload = () => ({
    key: form.key || slugify(form.labelFr).replace(/-/g, "_"),
    type: form.type,
    labelFr: form.labelFr,
    labelAr: form.labelAr,
    placeholderFr: form.placeholderFr || null,
    placeholderAr: form.placeholderAr || null,
    helpTextFr: form.helpTextFr || null,
    helpTextAr: form.helpTextAr || null,
    options: OPTION_TYPES.has(form.type) ? parseOptions(form.optionsText) : null,
    defaultValue: form.defaultValue || null,
    isRequired: form.isRequired,
    width: form.width,
    order: form.order,
    isPublished: form.isPublished,
    buttonStyle: form.type === "SUBMIT_BUTTON" ? form.buttonStyle : null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const payload = buildPayload();
      const result = editingId
        ? await updateAdmissionFormField({ id: editingId, ...payload })
        : await createAdmissionFormField(payload);
      if (result.success) {
        toast.success(editingId ? "Champ mis à jour" : "Champ ajouté");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const togglePublished = (field: AdmissionFormFieldRecord) => {
    startTransition(async () => {
      const result = await updateAdmissionFormField({
        id: field.id,
        key: field.key,
        type: field.type,
        labelFr: field.labelFr,
        labelAr: field.labelAr,
        placeholderFr: field.placeholderFr,
        placeholderAr: field.placeholderAr,
        helpTextFr: field.helpTextFr,
        helpTextAr: field.helpTextAr,
        options: field.options,
        defaultValue: field.defaultValue,
        isRequired: field.isRequired,
        width: field.width === "half" ? "half" : "full",
        order: field.order,
        isPublished: !field.isPublished,
        buttonStyle: field.buttonStyle as "ocean" | "outline" | "navy" | null,
      });
      if (result.success) router.refresh();
      else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <div className="grid gap-8 xl:grid-cols-5">
      <AdminPanel className="xl:col-span-2">
        <AdminPanelHeader
          icon={editingId ? Pencil : Plus}
          title={editingId ? "Modifier le champ" : "Nouveau champ"}
          description="Champs dynamiques du formulaire d'admission : texte, listes, documents, titres et bouton."
        />
        {canWrite ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type de champ
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as AdmissionFieldType,
                  }))
                }
                className="mt-1.5 flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm"
              >
                {ADMISSION_FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <AdminBilingualGrid>
              <AdminField
                label="Libellé (FR)"
                value={form.labelFr}
                onChange={(v) => {
                  setForm((f) => ({
                    ...f,
                    labelFr: v,
                    ...(!keyTouched
                      ? { key: slugify(v).replace(/-/g, "_") }
                      : {}),
                  }));
                }}
                required
              />
              <AdminField
                label="Libellé (AR)"
                value={form.labelAr}
                onChange={(v) => setForm((f) => ({ ...f, labelAr: v }))}
                dir="rtl"
                required
              />
            </AdminBilingualGrid>

            <AdminField
              label="Clé technique"
              value={form.key}
              onChange={(v) => {
                setKeyTouched(true);
                setForm((f) => ({ ...f, key: v }));
              }}
              hint="Identifiant unique (ex: birth_date)"
              required
            />

            {!CONTENT_TYPES.includes(form.type) && (
              <AdminBilingualGrid>
                <AdminField
                  label="Placeholder (FR)"
                  value={form.placeholderFr}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, placeholderFr: v }))
                  }
                />
                <AdminField
                  label="Placeholder (AR)"
                  value={form.placeholderAr}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, placeholderAr: v }))
                  }
                  dir="rtl"
                />
              </AdminBilingualGrid>
            )}

            <AdminBilingualGrid>
              <AdminTextField
                label="Texte d'aide (FR)"
                value={form.helpTextFr}
                onChange={(v) => setForm((f) => ({ ...f, helpTextFr: v }))}
                rows={2}
              />
              <AdminTextField
                label="Texte d'aide (AR)"
                value={form.helpTextAr}
                onChange={(v) => setForm((f) => ({ ...f, helpTextAr: v }))}
                dir="rtl"
                rows={2}
              />
            </AdminBilingualGrid>

            {OPTION_TYPES.has(form.type) && (
              <AdminTextField
                label="Options (une par ligne)"
                value={form.optionsText}
                onChange={(v) => setForm((f) => ({ ...f, optionsText: v }))}
                rows={4}
                placeholder={"bac|Baccalauréat|البكالوريا\nlicense|Licence|الإجازة"}
              />
            )}

            {form.type === "SUBMIT_BUTTON" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Style du bouton
                </label>
                <select
                  value={form.buttonStyle}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      buttonStyle: e.target.value as
                        | "ocean"
                        | "outline"
                        | "navy",
                    }))
                  }
                  className="mt-1.5 flex h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="ocean">Bleu (principal)</option>
                  <option value="outline">Contour</option>
                  <option value="navy">Marine</option>
                </select>
              </div>
            )}

            {!CONTENT_TYPES.includes(form.type) && (
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isRequired}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isRequired: e.target.checked }))
                    }
                  />
                  Obligatoire
                </label>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Largeur
                  </label>
                  <select
                    value={form.width}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        width: e.target.value as "full" | "half",
                      }))
                    }
                    className="mt-1 flex h-9 rounded-lg border border-slate-200 px-2 text-sm"
                  >
                    <option value="full">Pleine largeur</option>
                    <option value="half">Demi-largeur</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ordre
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, order: Number(e.target.value) }))
                    }
                    className="mt-1 h-9 w-20"
                  />
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
              />
              Visible sur le site
            </label>

            <AdminFormFooter className="mt-0 border-0 pt-0">
              <Button type="submit" variant="ocean" disabled={isPending}>
                {editingId ? "Enregistrer" : "Ajouter le champ"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              )}
            </AdminFormFooter>
          </form>
        ) : (
          <p className="text-sm text-slate-500">Lecture seule.</p>
        )}
      </AdminPanel>

      <AdminPanel className="xl:col-span-3">
        <AdminPanelHeader
          icon={FormInput}
          title="Champs du formulaire"
          description={`${fields.filter((f) => f.isPublished).length} publié(s) sur ${fields.length}`}
        />
        {fields.length === 0 ? (
          <AdminEmptyState>
            Aucun champ. Le formulaire par défaut sera utilisé après initialisation.
          </AdminEmptyState>
        ) : (
          <ul className="space-y-2">
            {fields.map((field) => (
              <li
                key={field.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
                  field.isPublished
                    ? "border-slate-200 bg-white"
                    : "border-slate-100 bg-slate-50"
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {field.labelFr}
                    </p>
                    <Badge variant="default">{TYPE_LABELS[field.type]}</Badge>
                    {field.isRequired && <Badge variant="ocean">Requis</Badge>}
                    {!field.isPublished && <Badge>Brouillon</Badge>}
                  </div>
                  <p className="text-xs text-slate-500">
                    {field.key} · ordre {field.order}
                    {field.width === "half" ? " · ½" : ""}
                  </p>
                </div>
                {canWrite && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePublished(field)}
                      disabled={isPending}
                    >
                      {field.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => loadField(field)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => {
                        if (!confirm("Supprimer ce champ ?")) return;
                        startTransition(async () => {
                          const r = await deleteAdmissionFormField(field.id);
                          if (r.success) {
                            toast.success("Champ supprimé");
                            if (editingId === field.id) resetForm();
                            router.refresh();
                          } else toast.error(r.error ?? "Erreur");
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
