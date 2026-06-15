"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  BarChart3,
  Building2,
  ExternalLink,
  Eye,
  EyeOff,
  Hash,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  createChiffresFormationItem,
  createChiffresGrowthBar,
  createChiffresHighlight,
  createChiffresInfrastructureItem,
  deleteChiffresFormationItem,
  deleteChiffresGrowthBar,
  deleteChiffresHighlight,
  deleteChiffresInfrastructureItem,
  updateChiffresFormationItem,
  updateChiffresGrowthBar,
  updateChiffresHighlight,
  updateChiffresInfrastructureItem,
  updateChiffresPage,
} from "@/actions/admin/chiffres.actions";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AdminBilingualGrid,
  AdminField,
  AdminFormFooter,
  AdminTextField,
} from "@/components/admin/admin-form-fields";
import { AdminEmptyState, AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { ABOUT_PAGE_SLUGS } from "@/lib/about-pages";
import { SITE_STAT_ICON_OPTIONS } from "@/lib/site-icons";
import type {
  ChiffresFormationItemRecord,
  ChiffresGrowthBarRecord,
  ChiffresHighlightRecord,
  ChiffresInfrastructureItemRecord,
  ChiffresPageSettings,
} from "@/services/chiffres.service";
import type { ChiffresInfraStyle, SiteStatIcon } from "@prisma/client";

const INFRA_STYLE_OPTIONS: { value: ChiffresInfraStyle; label: string }[] = [
  { value: "NAVY", label: "Bleu foncé" },
  { value: "GREY", label: "Gris clair" },
  { value: "OCEAN", label: "Bleu océan" },
  { value: "LIGHT", label: "Clair" },
];

interface ChiffresManagerProps {
  page: ChiffresPageSettings;
  highlights: ChiffresHighlightRecord[];
  growthBars: ChiffresGrowthBarRecord[];
  formationItems: ChiffresFormationItemRecord[];
  infrastructureItems: ChiffresInfrastructureItemRecord[];
  canWrite: boolean;
}

export function ChiffresManager({
  page,
  highlights,
  growthBars,
  formationItems,
  infrastructureItems,
  canWrite,
}: ChiffresManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pageForm, setPageForm] = useState(page);

  const publishedCount =
    highlights.filter((h) => h.isPublished).length +
    formationItems.filter((f) => f.isPublished).length +
    infrastructureItems.filter((i) => i.isPublished).length;

  const savePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const result = await updateChiffresPage({
        ...pageForm,
        chiffresPublished: page.chiffresPublished,
      });
      if (result.success) {
        toast.success("Paramètres enregistrés");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <div className="space-y-8">
      <AdminSectionToggleBanner
        sectionKey="chiffres"
        initialPublished={page.chiffresPublished}
        publishedCount={publishedCount}
        totalCount={
          highlights.length + growthBars.length + formationItems.length + infrastructureItems.length
        }
        itemLabel="élément"
        locations={`page /pages/${ABOUT_PAGE_SLUGS.chiffres}`}
        canWrite={canWrite}
      />

      <AdminPanel>
        <AdminPanelHeader
          icon={Hash}
          title="Paramètres de la page"
          description="Hero, sections, CTA et image de fond."
        />
        <p className="mb-4 text-sm text-slate-600">
          Page publique :{" "}
          <Link
            href={`/fr/pages/${ABOUT_PAGE_SLUGS.chiffres}`}
            target="_blank"
            className="inline-flex items-center gap-1 font-medium text-ocean-700 hover:underline"
          >
            /fr/pages/{ABOUT_PAGE_SLUGS.chiffres}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </p>
        {canWrite ? (
          <form onSubmit={savePage} className="space-y-6">
            <AdminBilingualGrid>
              <AdminField
                label="Titre hero (FR)"
                value={pageForm.chiffresPageTitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresPageTitleFr: v }))}
                required
              />
              <AdminField
                label="Titre hero (AR)"
                value={pageForm.chiffresPageTitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresPageTitleAr: v }))}
                dir="rtl"
                required
              />
              <AdminTextField
                label="Sous-titre hero (FR)"
                value={pageForm.chiffresPageSubtitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresPageSubtitleFr: v }))}
                className="sm:col-span-2"
              />
              <AdminTextField
                label="Sous-titre hero (AR)"
                value={pageForm.chiffresPageSubtitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresPageSubtitleAr: v }))}
                dir="rtl"
                className="sm:col-span-2"
              />
            </AdminBilingualGrid>

            <div>
              <AdminField
                label="Image de fond hero"
                value={pageForm.chiffresHeroBackgroundUrl ?? ""}
                onChange={(v) =>
                  setPageForm((s) => ({ ...s, chiffresHeroBackgroundUrl: v || null }))
                }
                placeholder="/images/about-cqpm-nador.jpg"
              />
              {canWrite && (
                <div className="mt-3">
                  <AdminImageUpload
                    folder="chiffres"
                    onUploaded={(url) => {
                      setPageForm((s) => ({ ...s, chiffresHeroBackgroundUrl: url }));
                      toast.success("Image téléversée");
                    }}
                    onError={(msg) => toast.error(msg)}
                  />
                </div>
              )}
            </div>

            <AdminBilingualGrid>
              <AdminField
                label="Titre évolution (FR)"
                value={pageForm.chiffresEvolutionTitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresEvolutionTitleFr: v }))}
              />
              <AdminField
                label="Titre évolution (AR)"
                value={pageForm.chiffresEvolutionTitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresEvolutionTitleAr: v }))}
                dir="rtl"
              />
              <AdminTextField
                label="Sous-titre évolution (FR)"
                value={pageForm.chiffresEvolutionSubtitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresEvolutionSubtitleFr: v }))}
                className="sm:col-span-2"
              />
              <AdminTextField
                label="Sous-titre évolution (AR)"
                value={pageForm.chiffresEvolutionSubtitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresEvolutionSubtitleAr: v }))}
                dir="rtl"
                className="sm:col-span-2"
              />
              <AdminField
                label="Titre graphique croissance (FR)"
                value={pageForm.chiffresGrowthChartTitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresGrowthChartTitleFr: v }))}
              />
              <AdminField
                label="Titre graphique croissance (AR)"
                value={pageForm.chiffresGrowthChartTitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresGrowthChartTitleAr: v }))}
                dir="rtl"
              />
              <AdminField
                label="Titre taux de réussite (FR)"
                value={pageForm.chiffresSuccessChartTitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresSuccessChartTitleFr: v }))}
              />
              <AdminField
                label="Titre taux de réussite (AR)"
                value={pageForm.chiffresSuccessChartTitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresSuccessChartTitleAr: v }))}
                dir="rtl"
              />
            </AdminBilingualGrid>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Taux de réussite (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={pageForm.chiffresSuccessRateValue}
                  onChange={(e) =>
                    setPageForm((s) => ({
                      ...s,
                      chiffresSuccessRateValue: Number(e.target.value),
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <AdminField
                label="Libellé taux (FR)"
                value={pageForm.chiffresSuccessRateLabelFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresSuccessRateLabelFr: v }))}
              />
              <AdminField
                label="Libellé taux (AR)"
                value={pageForm.chiffresSuccessRateLabelAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresSuccessRateLabelAr: v }))}
                dir="rtl"
              />
            </div>

            <AdminBilingualGrid>
              <AdminField
                label="Titre capacités (FR)"
                value={pageForm.chiffresCapacityTitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCapacityTitleFr: v }))}
              />
              <AdminField
                label="Titre capacités (AR)"
                value={pageForm.chiffresCapacityTitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCapacityTitleAr: v }))}
                dir="rtl"
              />
              <AdminField
                label="Colonne formation (FR)"
                value={pageForm.chiffresFormationColumnTitleFr}
                onChange={(v) =>
                  setPageForm((s) => ({ ...s, chiffresFormationColumnTitleFr: v }))
                }
              />
              <AdminField
                label="Colonne formation (AR)"
                value={pageForm.chiffresFormationColumnTitleAr}
                onChange={(v) =>
                  setPageForm((s) => ({ ...s, chiffresFormationColumnTitleAr: v }))
                }
                dir="rtl"
              />
              <AdminField
                label="Colonne infrastructure (FR)"
                value={pageForm.chiffresInfrastructureColumnTitleFr}
                onChange={(v) =>
                  setPageForm((s) => ({ ...s, chiffresInfrastructureColumnTitleFr: v }))
                }
              />
              <AdminField
                label="Colonne infrastructure (AR)"
                value={pageForm.chiffresInfrastructureColumnTitleAr}
                onChange={(v) =>
                  setPageForm((s) => ({ ...s, chiffresInfrastructureColumnTitleAr: v }))
                }
                dir="rtl"
              />
            </AdminBilingualGrid>

            <AdminBilingualGrid>
              <AdminField
                label="Titre CTA (FR)"
                value={pageForm.chiffresCtaTitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaTitleFr: v }))}
              />
              <AdminField
                label="Titre CTA (AR)"
                value={pageForm.chiffresCtaTitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaTitleAr: v }))}
                dir="rtl"
              />
              <AdminTextField
                label="Texte CTA (FR)"
                value={pageForm.chiffresCtaTextFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaTextFr: v }))}
                className="sm:col-span-2"
              />
              <AdminTextField
                label="Texte CTA (AR)"
                value={pageForm.chiffresCtaTextAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaTextAr: v }))}
                dir="rtl"
                className="sm:col-span-2"
              />
              <AdminField
                label="Bouton 1 (FR)"
                value={pageForm.chiffresCtaPrimaryLabelFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaPrimaryLabelFr: v }))}
              />
              <AdminField
                label="Bouton 1 (AR)"
                value={pageForm.chiffresCtaPrimaryLabelAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaPrimaryLabelAr: v }))}
                dir="rtl"
              />
              <AdminField
                label="Lien bouton 1"
                value={pageForm.chiffresCtaPrimaryHref}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaPrimaryHref: v }))}
                className="sm:col-span-2"
              />
              <AdminField
                label="Bouton 2 (FR)"
                value={pageForm.chiffresCtaSecondaryLabelFr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaSecondaryLabelFr: v }))}
              />
              <AdminField
                label="Bouton 2 (AR)"
                value={pageForm.chiffresCtaSecondaryLabelAr}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaSecondaryLabelAr: v }))}
                dir="rtl"
              />
              <AdminField
                label="Lien bouton 2"
                value={pageForm.chiffresCtaSecondaryHref}
                onChange={(v) => setPageForm((s) => ({ ...s, chiffresCtaSecondaryHref: v }))}
                className="sm:col-span-2"
              />
            </AdminBilingualGrid>

            <AdminFormFooter>
              <Button type="submit" variant="ocean" disabled={isPending}>
                {isPending ? "Enregistrement…" : "Enregistrer les paramètres"}
              </Button>
            </AdminFormFooter>
          </form>
        ) : null}
      </AdminPanel>

      <HighlightCrud highlights={highlights} canWrite={canWrite} />
      <GrowthBarCrud growthBars={growthBars} canWrite={canWrite} />
      <FormationCrud items={formationItems} canWrite={canWrite} />
      <InfrastructureCrud items={infrastructureItems} canWrite={canWrite} />
    </div>
  );
}

function HighlightCrud({
  highlights,
  canWrite,
}: {
  highlights: ChiffresHighlightRecord[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    labelFr: "",
    labelAr: "",
    value: 0,
    suffix: "+",
    icon: "USERS" as SiteStatIcon,
    order: highlights.length,
    isPublished: true,
  });

  const reset = () => {
    setEditingId(null);
    setForm({
      labelFr: "",
      labelAr: "",
      value: 0,
      suffix: "+",
      icon: "USERS",
      order: highlights.length,
      isPublished: true,
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const payload = { ...form, suffix: form.suffix || null };
      const result = editingId
        ? await updateChiffresHighlight({ id: editingId, ...payload })
        : await createChiffresHighlight(payload);
      if (result.success) {
        toast.success(editingId ? "Chiffre mis à jour" : "Chiffre ajouté");
        reset();
        router.refresh();
      } else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <CrudPanel
      icon={Hash}
      title="Chiffres clés (grille)"
      description="6 cartes principales sous le hero."
      items={highlights}
      canWrite={canWrite}
      editingId={editingId}
      onEdit={(item) => {
        setEditingId(item.id);
        setForm({
          labelFr: item.labelFr,
          labelAr: item.labelAr,
          value: item.value,
          suffix: item.suffix ?? "",
          icon: item.icon,
          order: item.order,
          isPublished: item.isPublished,
        });
      }}
      onDelete={(id) => {
        if (!confirm("Supprimer ce chiffre ?")) return;
        startTransition(async () => {
          const result = await deleteChiffresHighlight(id);
          if (result.success) {
            toast.success("Supprimé");
            if (editingId === id) reset();
            router.refresh();
          } else toast.error(result.error ?? "Erreur");
        });
      }}
      renderLabel={(item) => `${item.labelFr} — ${item.value}${item.suffix ?? ""}`}
      form={canWrite ? (
        <form onSubmit={submit} className="space-y-4">
          <AdminBilingualGrid>
            <AdminField label="Libellé (FR)" value={form.labelFr} onChange={(v) => setForm((f) => ({ ...f, labelFr: v }))} required />
            <AdminField label="Libellé (AR)" value={form.labelAr} onChange={(v) => setForm((f) => ({ ...f, labelAr: v }))} dir="rtl" required />
          </AdminBilingualGrid>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Valeur</label>
              <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} className="mt-1" />
            </div>
            <AdminField label="Suffixe (+, %)" value={form.suffix} onChange={(v) => setForm((f) => ({ ...f, suffix: v }))} />
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Ordre</label>
              <Input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Icône</label>
              <select value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value as SiteStatIcon }))} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                {SITE_STAT_ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
            Publié
          </label>
          <AdminFormFooter>
            {editingId && <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>}
            <Button type="submit" variant="ocean" disabled={isPending}>{editingId ? "Mettre à jour" : "Ajouter"}</Button>
          </AdminFormFooter>
        </form>
      ) : null}
    />
  );
}

function GrowthBarCrud({ growthBars, canWrite }: { growthBars: ChiffresGrowthBarRecord[]; canWrite: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ labelFr: "", labelAr: "", value: 0, order: growthBars.length });

  const reset = () => {
    setEditingId(null);
    setForm({ labelFr: "", labelAr: "", value: 0, order: growthBars.length });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const result = editingId
        ? await updateChiffresGrowthBar({ id: editingId, ...form })
        : await createChiffresGrowthBar(form);
      if (result.success) {
        toast.success(editingId ? "Barre mise à jour" : "Barre ajoutée");
        reset();
        router.refresh();
      } else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <CrudPanel
      icon={BarChart3}
      title="Graphique croissance"
      description="Barres du graphique « Croissance des effectifs »."
      items={growthBars}
      canWrite={canWrite}
      editingId={editingId}
      onEdit={(item) => {
        setEditingId(item.id);
        setForm({ labelFr: item.labelFr, labelAr: item.labelAr, value: item.value, order: item.order });
      }}
      onDelete={(id) => {
        if (!confirm("Supprimer cette barre ?")) return;
        startTransition(async () => {
          const result = await deleteChiffresGrowthBar(id);
          if (result.success) {
            toast.success("Supprimé");
            if (editingId === id) reset();
            router.refresh();
          } else toast.error(result.error ?? "Erreur");
        });
      }}
      renderLabel={(item) => `${item.labelFr} — ${item.value}`}
      form={canWrite ? (
        <form onSubmit={submit} className="space-y-4">
          <AdminBilingualGrid>
            <AdminField label="Libellé (FR)" value={form.labelFr} onChange={(v) => setForm((f) => ({ ...f, labelFr: v }))} required />
            <AdminField label="Libellé (AR)" value={form.labelAr} onChange={(v) => setForm((f) => ({ ...f, labelAr: v }))} dir="rtl" required />
          </AdminBilingualGrid>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Valeur</label>
              <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Ordre</label>
              <Input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} className="mt-1" />
            </div>
          </div>
          <AdminFormFooter>
            {editingId && <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>}
            <Button type="submit" variant="ocean" disabled={isPending}>{editingId ? "Mettre à jour" : "Ajouter"}</Button>
          </AdminFormFooter>
        </form>
      ) : null}
    />
  );
}

function FormationCrud({ items, canWrite }: { items: ChiffresFormationItemRecord[]; canWrite: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    labelFr: "",
    labelAr: "",
    valueText: "",
    icon: "BUILDING" as SiteStatIcon,
    order: items.length,
    isPublished: true,
  });

  const reset = () => {
    setEditingId(null);
    setForm({ labelFr: "", labelAr: "", valueText: "", icon: "BUILDING", order: items.length, isPublished: true });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const result = editingId
        ? await updateChiffresFormationItem({ id: editingId, ...form })
        : await createChiffresFormationItem(form);
      if (result.success) {
        toast.success(editingId ? "Ligne mise à jour" : "Ligne ajoutée");
        reset();
        router.refresh();
      } else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <CrudPanel
      icon={TrendingUp}
      title="Capacités — Formation"
      description="Liste de la colonne Formation."
      items={items}
      canWrite={canWrite}
      editingId={editingId}
      onEdit={(item) => {
        setEditingId(item.id);
        setForm({
          labelFr: item.labelFr,
          labelAr: item.labelAr,
          valueText: item.valueText,
          icon: item.icon,
          order: item.order,
          isPublished: item.isPublished,
        });
      }}
      onDelete={(id) => {
        if (!confirm("Supprimer ?")) return;
        startTransition(async () => {
          const result = await deleteChiffresFormationItem(id);
          if (result.success) {
            toast.success("Supprimé");
            if (editingId === id) reset();
            router.refresh();
          } else toast.error(result.error ?? "Erreur");
        });
      }}
      renderLabel={(item) => `${item.labelFr} — ${item.valueText}`}
      form={canWrite ? (
        <form onSubmit={submit} className="space-y-4">
          <AdminBilingualGrid>
            <AdminField label="Libellé (FR)" value={form.labelFr} onChange={(v) => setForm((f) => ({ ...f, labelFr: v }))} required />
            <AdminField label="Libellé (AR)" value={form.labelAr} onChange={(v) => setForm((f) => ({ ...f, labelAr: v }))} dir="rtl" required />
            <AdminField label="Valeur affichée" value={form.valueText} onChange={(v) => setForm((f) => ({ ...f, valueText: v }))} className="sm:col-span-2" />
          </AdminBilingualGrid>
          <AdminFormFooter>
            {editingId && <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>}
            <Button type="submit" variant="ocean" disabled={isPending}>{editingId ? "Mettre à jour" : "Ajouter"}</Button>
          </AdminFormFooter>
        </form>
      ) : null}
    />
  );
}

function InfrastructureCrud({
  items,
  canWrite,
}: {
  items: ChiffresInfrastructureItemRecord[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    labelFr: "",
    labelAr: "",
    valueText: "",
    icon: "BUILDING" as SiteStatIcon,
    style: "GREY" as ChiffresInfraStyle,
    order: items.length,
    isPublished: true,
  });

  const reset = () => {
    setEditingId(null);
    setForm({
      labelFr: "",
      labelAr: "",
      valueText: "",
      icon: "BUILDING",
      style: "GREY",
      order: items.length,
      isPublished: true,
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const result = editingId
        ? await updateChiffresInfrastructureItem({ id: editingId, ...form })
        : await createChiffresInfrastructureItem(form);
      if (result.success) {
        toast.success(editingId ? "Carte mise à jour" : "Carte ajoutée");
        reset();
        router.refresh();
      } else toast.error(result.error ?? "Erreur");
    });
  };

  return (
    <CrudPanel
      icon={Building2}
      title="Capacités — Infrastructure"
      description="Cartes colorées de la colonne Infrastructure."
      items={items}
      canWrite={canWrite}
      editingId={editingId}
      onEdit={(item) => {
        setEditingId(item.id);
        setForm({
          labelFr: item.labelFr,
          labelAr: item.labelAr,
          valueText: item.valueText,
          icon: item.icon,
          style: item.style,
          order: item.order,
          isPublished: item.isPublished,
        });
      }}
      onDelete={(id) => {
        if (!confirm("Supprimer ?")) return;
        startTransition(async () => {
          const result = await deleteChiffresInfrastructureItem(id);
          if (result.success) {
            toast.success("Supprimé");
            if (editingId === id) reset();
            router.refresh();
          } else toast.error(result.error ?? "Erreur");
        });
      }}
      renderLabel={(item) => `${item.labelFr} — ${item.valueText}`}
      form={canWrite ? (
        <form onSubmit={submit} className="space-y-4">
          <AdminBilingualGrid>
            <AdminField label="Libellé (FR)" value={form.labelFr} onChange={(v) => setForm((f) => ({ ...f, labelFr: v }))} required />
            <AdminField label="Libellé (AR)" value={form.labelAr} onChange={(v) => setForm((f) => ({ ...f, labelAr: v }))} dir="rtl" required />
            <AdminField label="Valeur affichée" value={form.valueText} onChange={(v) => setForm((f) => ({ ...f, valueText: v }))} />
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Style</label>
              <select value={form.style} onChange={(e) => setForm((f) => ({ ...f, style: e.target.value as ChiffresInfraStyle }))} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                {INFRA_STYLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </AdminBilingualGrid>
          <AdminFormFooter>
            {editingId && <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>}
            <Button type="submit" variant="ocean" disabled={isPending}>{editingId ? "Mettre à jour" : "Ajouter"}</Button>
          </AdminFormFooter>
        </form>
      ) : null}
    />
  );
}

function CrudPanel<T extends { id: string; isPublished?: boolean }>({
  icon: Icon,
  title,
  description,
  items,
  canWrite,
  editingId,
  onEdit,
  onDelete,
  renderLabel,
  form,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  items: T[];
  canWrite: boolean;
  editingId: string | null;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  renderLabel: (item: T) => string;
  form: React.ReactNode;
}) {
  return (
    <AdminPanel>
      <AdminPanelHeader icon={Icon} title={title} description={description} />
      {items.length === 0 ? (
        <AdminEmptyState message="Aucun élément." />
      ) : (
        <ul className="mb-6 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-2">
                {"isPublished" in item && item.isPublished === false && (
                  <Badge variant="secondary">Masqué</Badge>
                )}
                <span className="text-sm font-medium text-slate-800">{renderLabel(item)}</span>
              </div>
              {canWrite && (
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {form}
    </AdminPanel>
  );
}
