"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminBilingualGrid,
  AdminField,
  AdminFormFooter,
  AdminSelect,
  AdminTextField,
} from "@/components/admin/admin-form-fields";
import {
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-panel";
import {
  createFormationDocumentRequirement,
  deleteFormationDocumentRequirement,
  updateFormationDocumentRequirement,
} from "@/actions/admin/admission-form.actions";
import type { FormationDocumentRequirementRecord } from "@/services/admission-form.service";
import { cn, slugify } from "@/lib/utils";

type FormationOption = {
  id: string;
  titleFr: string;
};

type RequirementWithFormation = FormationDocumentRequirementRecord & {
  formation: FormationOption;
};

type AcceptType = "pdf" | "image" | "pdf_image";

interface FormationDocumentsManagerProps {
  formations: FormationOption[];
  requirements: RequirementWithFormation[];
  canWrite: boolean;
}

const ACCEPT_TYPE_LABELS: Record<AcceptType, string> = {
  pdf: "PDF",
  image: "Image",
  pdf_image: "PDF ou image",
};

const defaultForm = (
  formations: FormationOption[],
  requirements: RequirementWithFormation[]
) => ({
  formationId: formations[0]?.id ?? "",
  documentKey: "",
  labelFr: "",
  labelAr: "",
  hintFr: "",
  hintAr: "",
  acceptTypes: "pdf" as AcceptType,
  maxSizeMb: 8,
  order: requirements.length,
  isRequired: true,
});

export function FormationDocumentsManager({
  formations,
  requirements,
  canWrite,
}: FormationDocumentsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFormationId, setSelectedFormationId] = useState("all");
  const [keyTouched, setKeyTouched] = useState(false);
  const [form, setForm] = useState(() => defaultForm(formations, requirements));

  const visibleRequirements = useMemo(
    () =>
      selectedFormationId === "all"
        ? requirements
        : requirements.filter((r) => r.formationId === selectedFormationId),
    [requirements, selectedFormationId]
  );

  const groupedRequirements = useMemo(() => {
    const groups = new Map<string, RequirementWithFormation[]>();
    for (const requirement of visibleRequirements) {
      const key = requirement.formationId;
      groups.set(key, [...(groups.get(key) ?? []), requirement]);
    }
    return Array.from(groups.entries()).map(([formationId, items]) => ({
      formation:
        formations.find((formation) => formation.id === formationId) ??
        items[0].formation,
      items,
    }));
  }, [formations, visibleRequirements]);

  const resetForm = () => {
    setEditingId(null);
    setKeyTouched(false);
    setForm(defaultForm(formations, requirements));
  };

  const loadRequirement = (requirement: RequirementWithFormation) => {
    setEditingId(requirement.id);
    setKeyTouched(true);
    setForm({
      formationId: requirement.formationId,
      documentKey: requirement.documentKey,
      labelFr: requirement.labelFr,
      labelAr: requirement.labelAr,
      hintFr: requirement.hintFr ?? "",
      hintAr: requirement.hintAr ?? "",
      acceptTypes: requirement.acceptTypes as AcceptType,
      maxSizeMb: requirement.maxSizeMb,
      order: requirement.order,
      isRequired: requirement.isRequired,
    });
  };

  const buildPayload = () => ({
    formationId: form.formationId,
    documentKey:
      form.documentKey || slugify(form.labelFr).replace(/-/g, "_"),
    labelFr: form.labelFr,
    labelAr: form.labelAr,
    hintFr: form.hintFr || null,
    hintAr: form.hintAr || null,
    acceptTypes: form.acceptTypes,
    maxSizeMb: form.maxSizeMb,
    order: form.order,
    isRequired: form.isRequired,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const payload = buildPayload();
      const result = editingId
        ? await updateFormationDocumentRequirement({ id: editingId, ...payload })
        : await createFormationDocumentRequirement(payload);
      if (result.success) {
        toast.success(editingId ? "Pièce jointe mise à jour" : "Pièce jointe ajoutée");
        resetForm();
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
          icon={editingId ? Pencil : Plus}
          title={editingId ? "Modifier la pièce" : "Nouvelle pièce"}
          description="Définissez les documents requis pour chaque formation."
        />
        {canWrite ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminSelect
              id="formationId"
              label="Formation"
              value={form.formationId}
              onChange={(v) => setForm((f) => ({ ...f, formationId: v }))}
            >
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.titleFr}
                </option>
              ))}
            </AdminSelect>

            <AdminBilingualGrid>
              <AdminField
                label="Libellé (FR)"
                value={form.labelFr}
                onChange={(v) => {
                  setForm((f) => ({
                    ...f,
                    labelFr: v,
                    ...(!keyTouched
                      ? { documentKey: slugify(v).replace(/-/g, "_") }
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
              label="Clé document"
              value={form.documentKey}
              onChange={(v) => {
                setKeyTouched(true);
                setForm((f) => ({ ...f, documentKey: v }));
              }}
              hint="Identifiant unique par formation (ex: cin, diploma)"
              required
            />

            <AdminBilingualGrid>
              <AdminTextField
                label="Indication (FR)"
                value={form.hintFr}
                onChange={(v) => setForm((f) => ({ ...f, hintFr: v }))}
                rows={2}
              />
              <AdminTextField
                label="Indication (AR)"
                value={form.hintAr}
                onChange={(v) => setForm((f) => ({ ...f, hintAr: v }))}
                dir="rtl"
                rows={2}
              />
            </AdminBilingualGrid>

            <div className="grid gap-4 sm:grid-cols-3">
              <AdminSelect
                id="acceptTypes"
                label="Fichiers acceptés"
                value={form.acceptTypes}
                onChange={(v) =>
                  setForm((f) => ({ ...f, acceptTypes: v as AcceptType }))
                }
              >
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
                <option value="pdf_image">PDF ou image</option>
              </AdminSelect>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Taille max (Mo)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={16}
                  value={form.maxSizeMb}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxSizeMb: Number(e.target.value),
                    }))
                  }
                  className="mt-1.5 h-11 border-slate-200 bg-slate-50/50"
                />
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
                  className="mt-1.5 h-11 border-slate-200 bg-slate-50/50"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isRequired}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isRequired: e.target.checked }))
                }
              />
              Document obligatoire
            </label>

            <AdminFormFooter className="mt-0 border-0 pt-0">
              <Button
                type="submit"
                variant="ocean"
                disabled={isPending || formations.length === 0}
              >
                {editingId ? "Enregistrer" : "Ajouter la pièce"}
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
          icon={FileText}
          title="Pièces jointes par formation"
          description={`${requirements.length} exigence(s) configurée(s)`}
          actions={
            <select
              value={selectedFormationId}
              onChange={(e) => setSelectedFormationId(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="all">Toutes les formations</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.titleFr}
                </option>
              ))}
            </select>
          }
        />

        {requirements.length === 0 ? (
          <AdminEmptyState>
            Aucun document requis n&apos;est encore configuré.
          </AdminEmptyState>
        ) : groupedRequirements.length === 0 ? (
          <AdminEmptyState>
            Aucun document requis pour cette formation.
          </AdminEmptyState>
        ) : (
          <div className="space-y-5">
            {groupedRequirements.map(({ formation, items }) => (
              <section key={formation.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">
                    {formation.titleFr}
                  </h3>
                  <Badge variant="default">
                    {items.length} document{items.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {items.map((requirement) => (
                    <li
                      key={requirement.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3",
                        !requirement.isRequired && "border-slate-100 bg-slate-50"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">
                            {requirement.labelFr}
                          </p>
                          <Badge variant="default">
                            {ACCEPT_TYPE_LABELS[
                              requirement.acceptTypes as AcceptType
                            ] ?? requirement.acceptTypes}
                          </Badge>
                          {requirement.isRequired ? (
                            <Badge variant="ocean">Requis</Badge>
                          ) : (
                            <Badge>Optionnel</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {requirement.documentKey} · {requirement.maxSizeMb} Mo · ordre{" "}
                          {requirement.order}
                        </p>
                      </div>
                      {canWrite && (
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => loadRequirement(requirement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            disabled={isPending}
                            onClick={() => {
                              if (!confirm("Supprimer cette pièce jointe ?")) return;
                              startTransition(async () => {
                                const result =
                                  await deleteFormationDocumentRequirement(
                                    requirement.id
                                  );
                                if (result.success) {
                                  toast.success("Pièce jointe supprimée");
                                  if (editingId === requirement.id) resetForm();
                                  router.refresh();
                                } else {
                                  toast.error(result.error ?? "Erreur");
                                }
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
              </section>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
