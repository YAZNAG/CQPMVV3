"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ExternalLink,
  Eye,
  EyeOff,
  GitBranch,
  Network,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  createOrgChartNode,
  deleteOrgChartNode,
  updateOrgChartNode,
  updateOrgChartPage,
} from "@/actions/admin/org-chart.actions";
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
import {
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-panel";
import { ABOUT_PAGE_SLUGS } from "@/lib/about-pages";
import {
  flattenOrgChartForSelect,
  type OrgChartNodeRecord,
  type OrgChartPageSettings,
} from "@/services/org-chart.service";
import { cn } from "@/lib/utils";

const inputClass =
  "border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white focus-visible:ring-ocean-500/30";

const STYLE_OPTIONS = [
  { value: "LEADERSHIP", label: "Direction (bleu foncé)" },
  { value: "DEPARTMENT_WHITE", label: "Département — blanc" },
  { value: "DEPARTMENT_BLUE", label: "Département — bleu clair" },
  { value: "DEPARTMENT_ORANGE", label: "Département — orange" },
  { value: "UNIT", label: "Unité / service" },
] as const;

const ACCENT_OPTIONS = [
  { value: "NONE", label: "Aucune" },
  { value: "PINK", label: "Rose" },
  { value: "GREEN", label: "Vert" },
  { value: "PURPLE", label: "Violet" },
  { value: "YELLOW", label: "Jaune" },
  { value: "TEAL", label: "Teal" },
  { value: "SKY", label: "Bleu ciel" },
] as const;

const ICON_OPTIONS = [
  { value: "USER", label: "Personne" },
  { value: "USERS", label: "Équipe" },
  { value: "WRENCH", label: "Technique" },
  { value: "BUILDING", label: "Bâtiment" },
  { value: "SHIP", label: "Navire" },
  { value: "GRADUATION_CAP", label: "Formation" },
  { value: "SHIELD", label: "Sécurité" },
  { value: "BOOK", label: "Pédagogie" },
  { value: "BOX", label: "Magasin" },
  { value: "NONE", label: "Sans icône" },
] as const;

type FormState = {
  titleFr: string;
  titleAr: string;
  parentId: string | null;
  style: (typeof STYLE_OPTIONS)[number]["value"];
  accent: (typeof ACCENT_OPTIONS)[number]["value"];
  icon: (typeof ICON_OPTIONS)[number]["value"];
  order: number;
  isPublished: boolean;
};

const defaultForm = (nodes: OrgChartNodeRecord[], parentId: string | null = null): FormState => ({
  titleFr: "",
  titleAr: "",
  parentId,
  style: "DEPARTMENT_WHITE",
  accent: "NONE",
  icon: "USER",
  order: nodes.filter((n) => n.parentId === parentId).length,
  isPublished: true,
});

interface OrgChartManagerProps {
  nodes: OrgChartNodeRecord[];
  page: OrgChartPageSettings;
  canWrite: boolean;
}

export function OrgChartManager({ nodes, page, canWrite }: OrgChartManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pageForm, setPageForm] = useState(page);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultForm(nodes));

  const publishedCount = nodes.filter((n) => n.isPublished).length;
  const parentOptions = useMemo(
    () => flattenOrgChartForSelect(nodes, editingId ?? undefined),
    [nodes, editingId]
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm(nodes));
  };

  const loadNode = (node: OrgChartNodeRecord) => {
    setEditingId(node.id);
    setForm({
      titleFr: node.titleFr,
      titleAr: node.titleAr,
      parentId: node.parentId,
      style: node.style,
      accent: node.accent,
      icon: node.icon,
      order: node.order,
      isPublished: node.isPublished,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const savePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const result = await updateOrgChartPage({
        ...pageForm,
        orgChartPublished: page.orgChartPublished,
      });
      if (result.success) {
        toast.success("Paramètres enregistrés");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const saveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const payload = { ...form, parentId: form.parentId || null };
      const result = editingId
        ? await updateOrgChartNode({ id: editingId, ...payload })
        : await createOrgChartNode(payload);
      if (result.success) {
        toast.success(editingId ? "Poste mis à jour" : "Poste ajouté");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const toggleNodePublished = (node: OrgChartNodeRecord) => {
    if (!canWrite) return;
    startTransition(async () => {
      const result = await updateOrgChartNode({
        id: node.id,
        titleFr: node.titleFr,
        titleAr: node.titleAr,
        parentId: node.parentId,
        style: node.style,
        accent: node.accent,
        icon: node.icon,
        order: node.order,
        isPublished: !node.isPublished,
      });
      if (result.success) {
        toast.success(node.isPublished ? "Poste masqué" : "Poste activé");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce poste ? Les postes enfants resteront sans parent.")) return;
    startTransition(async () => {
      const result = await deleteOrgChartNode(id);
      if (result.success) {
        toast.success("Poste supprimé");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const treeRows = useMemo(() => {
    return parentOptions.filter((o) => o.id !== null).map((opt) => {
      const node = nodes.find((n) => n.id === opt.id)!;
      return { node, depth: opt.depth };
    });
  }, [nodes, parentOptions]);

  return (
    <div className="space-y-8">
      <AdminSectionToggleBanner
        sectionKey="orgChart"
        initialPublished={page.orgChartPublished}
        publishedCount={publishedCount}
        totalCount={nodes.length}
        itemLabel="poste"
        locations="page À propos /organigramme"
        canWrite={canWrite}
      />

      <AdminPanel>
        <AdminPanelHeader
          icon={Network}
          title="Paramètres de la page"
          description="Titre, sous-titre et image de fond affichés sur /pages/organigramme."
        />
        <p className="mb-4 text-sm text-slate-600">
          Page publique :{" "}
          <Link
            href={`/fr/pages/${ABOUT_PAGE_SLUGS.organigramme}`}
            target="_blank"
            className="inline-flex items-center gap-1 font-medium text-ocean-700 hover:underline"
          >
            /fr/pages/{ABOUT_PAGE_SLUGS.organigramme}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </p>
        {canWrite ? (
          <form onSubmit={savePage} className="space-y-4">
            <AdminBilingualGrid>
              <AdminField
                label="Titre page (FR)"
                value={pageForm.orgChartPageTitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, orgChartPageTitleFr: v }))}
                required
              />
              <AdminField
                label="Titre page (AR)"
                value={pageForm.orgChartPageTitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, orgChartPageTitleAr: v }))}
                dir="rtl"
                required
              />
              <AdminTextField
                label="Sous-titre (FR)"
                value={pageForm.orgChartPageSubtitleFr}
                onChange={(v) => setPageForm((s) => ({ ...s, orgChartPageSubtitleFr: v }))}
                className="sm:col-span-2"
              />
              <AdminTextField
                label="Sous-titre (AR)"
                value={pageForm.orgChartPageSubtitleAr}
                onChange={(v) => setPageForm((s) => ({ ...s, orgChartPageSubtitleAr: v }))}
                dir="rtl"
                className="sm:col-span-2"
              />
            </AdminBilingualGrid>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Image de fond (organigramme)
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Affichée en arrière-plan à droite de la page (style ITPM).
              </p>
              <AdminField
                label="URL image"
                value={pageForm.orgChartBackgroundUrl ?? ""}
                onChange={(v) =>
                  setPageForm((s) => ({ ...s, orgChartBackgroundUrl: v || null }))
                }
                placeholder="/images/about-cqpm-nador.jpg"
              />
              {pageForm.orgChartBackgroundUrl ? (
                <div
                  className="mt-3 h-24 rounded-lg border border-slate-200 bg-[#e8edf2] bg-no-repeat"
                  style={{
                    backgroundImage: `url(${pageForm.orgChartBackgroundUrl})`,
                    backgroundPosition: "right center",
                    backgroundSize: "auto 100%",
                  }}
                  aria-hidden
                />
              ) : null}
              {canWrite ? (
                <div className="mt-3">
                  <AdminImageUpload
                    folder="organigramme"
                    onUploaded={(url) => {
                      setPageForm((s) => ({ ...s, orgChartBackgroundUrl: url }));
                      toast.success("Image téléversée");
                    }}
                    onError={(msg) => toast.error(msg)}
                  />
                </div>
              ) : null}
            </div>
            <AdminFormFooter>
              <Button type="submit" variant="ocean" disabled={isPending}>
                {isPending ? "Enregistrement…" : "Enregistrer les paramètres"}
              </Button>
            </AdminFormFooter>
          </form>
        ) : null}
      </AdminPanel>

      <div className="grid gap-8 xl:grid-cols-5">
        <AdminPanel className="xl:col-span-2">
          <AdminPanelHeader
            icon={editingId ? Pencil : Plus}
            title={editingId ? "Modifier le poste" : "Nouveau poste"}
            description="Titre bilingue, parent hiérarchique, style et icône."
          />
          {canWrite ? (
            <form onSubmit={saveNode} className="space-y-4">
              <AdminBilingualGrid>
                <AdminField
                  label="Intitulé (FR)"
                  value={form.titleFr}
                  onChange={(v) => setForm((f) => ({ ...f, titleFr: v }))}
                  required
                />
                <AdminField
                  label="Intitulé (AR)"
                  value={form.titleAr}
                  onChange={(v) => setForm((f) => ({ ...f, titleAr: v }))}
                  dir="rtl"
                  required
                />
              </AdminBilingualGrid>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rattachement (parent)
                </label>
                <select
                  value={form.parentId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      parentId: e.target.value || null,
                      order: nodes.filter(
                        (n) => n.parentId === (e.target.value || null)
                      ).length,
                    }))
                  }
                  className={cn("mt-1.5 h-11 w-full rounded-lg border px-3 text-sm", inputClass)}
                >
                  {parentOptions.map((opt) => (
                    <option key={opt.id ?? "root"} value={opt.id ?? ""}>
                      {"—".repeat(Math.max(0, opt.depth - 1))} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Style
                  </label>
                  <select
                    value={form.style}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        style: e.target.value as FormState["style"],
                      }))
                    }
                    className={cn("mt-1.5 h-11 w-full rounded-lg border px-3 text-sm", inputClass)}
                  >
                    {STYLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bordure (unités)
                  </label>
                  <select
                    value={form.accent}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        accent: e.target.value as FormState["accent"],
                      }))
                    }
                    className={cn("mt-1.5 h-11 w-full rounded-lg border px-3 text-sm", inputClass)}
                  >
                    {ACCENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Icône
                  </label>
                  <select
                    value={form.icon}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        icon: e.target.value as FormState["icon"],
                      }))
                    }
                    className={cn("mt-1.5 h-11 w-full rounded-lg border px-3 text-sm", inputClass)}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
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
                    className={cn("mt-1.5", inputClass)}
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-800">Poste visible sur le site</span>
              </label>

              <AdminFormFooter>
                <Button type="submit" variant="ocean" disabled={isPending}>
                  {isPending ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter le poste"}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                ) : null}
              </AdminFormFooter>
            </form>
          ) : (
            <p className="text-sm text-slate-500">Lecture seule.</p>
          )}
        </AdminPanel>

        <AdminPanel className="xl:col-span-3">
          <AdminPanelHeader
            icon={GitBranch}
            title={`Structure (${nodes.length} postes)`}
            description="Hiérarchie de l'organigramme — cliquez pour modifier."
          />
          {nodes.length === 0 ? (
            <AdminEmptyState>
              Aucun poste. Ajoutez le Directeur en racine pour commencer.
            </AdminEmptyState>
          ) : (
            <ul className="space-y-2">
              {treeRows.map(({ node, depth }) => (
                <li
                  key={node.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
                    !node.isPublished && "opacity-60",
                    editingId === node.id
                      ? "border-ocean-300 bg-ocean-50/40"
                      : "border-slate-200 bg-white"
                  )}
                  style={{ marginInlineStart: `${(depth - 1) * 1.25}rem` }}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{node.titleFr}</p>
                    <p className="text-xs text-slate-500" dir="rtl">
                      {node.titleAr}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="default">{node.style.replace(/_/g, " ")}</Badge>
                      <Badge variant={node.isPublished ? "ocean" : "default"}>
                        {node.isPublished ? "Actif" : "Masqué"}
                      </Badge>
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => loadNode(node)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleNodePublished(node)}
                        title={node.isPublished ? "Masquer" : "Activer"}
                      >
                        {node.isPublished ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(node.id)}
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
    </div>
  );
}
