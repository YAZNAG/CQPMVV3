"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle, AdminPanel } from "@/components/admin/admin-panel";
import {
  createNavigationItem,
  deleteNavigationItem,
  toggleNavigationItemPublished,
  updateNavigationItem,
} from "@/actions/admin/navigation.actions";
import type { NavigationItemType, NavigationLocation } from "@prisma/client";
import type { NavigationTreeItem } from "@/services/navigation.service";
import type { SitePageNavOption } from "@/services/site-page.service";
import { cn } from "@/lib/utils";

type FlatNavItem = NavigationTreeItem & { depth: number };

function flattenTree(items: NavigationTreeItem[], depth = 0): FlatNavItem[] {
  return items.flatMap((item) => [
    { ...item, depth },
    ...flattenTree(item.children, depth + 1),
  ]);
}

interface NavigationManagerProps {
  links: NavigationTreeItem[];
  buttons: Array<Omit<NavigationTreeItem, "children">>;
  publishedPages: SitePageNavOption[];
  canWrite: boolean;
}

const defaultForm = (
  links: NavigationTreeItem[],
  buttons: Array<Omit<NavigationTreeItem, "children">>
) => ({
  labelFr: "",
  labelAr: "",
  href: "/",
  location: "HEADER" as NavigationLocation,
  itemType: "LINK" as NavigationItemType,
  order: links.reduce((n, i) => n + 1 + i.children.length, 0) + buttons.length,
  isPublished: true,
  exactMatch: false,
  openInNewTab: false,
  parentId: "" as string,
});

export function NavigationManager({
  links,
  buttons,
  publishedPages,
  canWrite,
}: NavigationManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(links.map((item) => [item.id, true]))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => defaultForm(links, buttons));

  const flatItems = flattenTree(links);
  const totalCount = flatItems.length + buttons.length;
  const parentOptions = links;

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm(links, buttons));
  };

  const loadEdit = (item: FlatNavItem | Omit<NavigationTreeItem, "children">) => {
    setEditingId(item.id);
    setForm({
      labelFr: item.labelFr,
      labelAr: item.labelAr,
      href: item.href,
      location: item.location === "BOTH" && item.itemType === "BUTTON" ? "HEADER" : item.location,
      itemType: item.itemType,
      order: item.order,
      isPublished: item.isPublished,
      exactMatch: item.exactMatch,
      openInNewTab: item.openInNewTab,
      parentId: item.parentId ?? "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    const payload = {
      ...form,
      parentId: form.parentId || null,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateNavigationItem({ id: editingId, ...payload })
        : await createNavigationItem(payload);

      if (result.success) {
        toast.success(editingId ? "Élément mis à jour" : "Élément créé");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!canWrite) return;
    if (!confirm("Supprimer cet élément de navigation ?")) return;

    startTransition(async () => {
      const result = await deleteNavigationItem(id);
      if (result.success) {
        toast.success("Élément supprimé");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleTogglePublished = (
    id: string,
    currentPublished: boolean,
    label: string
  ) => {
    if (!canWrite) return;

    const nextPublished = !currentPublished;
    startTransition(async () => {
      const result = await toggleNavigationItemPublished({
        id,
        isPublished: nextPublished,
      });
      if (result.success) {
        toast.success(
          nextPublished
            ? `"${label}" activé — visible sur le site`
            : `"${label}" désactivé — masqué du menu`
        );
        if (editingId === id) {
          setForm((f) => ({ ...f, isPublished: nextPublished }));
        }
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const renderStatusBadge = (isPublished: boolean) => (
    <Badge
      className={cn(
        "px-2 py-0.5 text-[10px] uppercase tracking-wide",
        isPublished
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-200 text-slate-700"
      )}
    >
      {isPublished ? "Active" : "Inactive"}
    </Badge>
  );

  const renderItemActions = (
    item: { id: string; labelFr: string; isPublished: boolean },
    onEdit: () => void
  ) =>
    canWrite ? (
      <div className="flex shrink-0 flex-wrap gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-slate-200 text-xs"
          onClick={() =>
            handleTogglePublished(item.id, item.isPublished, item.labelFr)
          }
          disabled={isPending}
        >
          {item.isPublished ? "Désactiver" : "Activer"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
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
    ) : null;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (nodes: NavigationTreeItem[], depth = 0) =>
    nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const isExpanded = expanded[node.id] ?? true;

      return (
        <div key={node.id}>
          <div
            className={cn(
              "flex items-start justify-between gap-3 rounded-lg border border-transparent px-3 py-3 hover:border-slate-200 hover:bg-slate-50",
              editingId === node.id && "border-ocean-200 bg-ocean-50/40"
            )}
            style={{ marginInlineStart: depth * 24 }}
          >
            <div className="flex min-w-0 flex-1 items-start gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  className="mt-0.5 rounded p-0.5 text-slate-500 hover:bg-white"
                  aria-label={isExpanded ? "Réduire" : "Développer"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : depth > 0 ? (
                <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <span className="w-5" />
              )}

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-navy-900">{node.labelFr}</p>
                  <span className="text-sm text-slate-500">({node.labelAr})</span>
                  {renderStatusBadge(node.isPublished)}
                  {hasChildren && (
                    <span className="rounded bg-ocean-100 px-2 py-0.5 text-[11px] font-medium text-ocean-800">
                      {node.children.length} sous-menu(s)
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {node.href}
                  {node.location !== "HEADER" && ` · ${node.location}`}
                  {!node.isPublished && " · masqué sur le site public"}
                </p>
              </div>
            </div>

            {renderItemActions(node, () => loadEdit({ ...node, depth }))}
          </div>

          {hasChildren && isExpanded && renderTree(node.children, depth + 1)}
        </div>
      );
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          {totalCount} élément{totalCount > 1 ? "s" : ""} au total
        </p>
        {canWrite && (
          <Button type="button" variant="ocean" onClick={resetForm}>
            <Plus className="h-4 w-4" />
            Nouvel élément
          </Button>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-5">
        <AdminCard className="xl:col-span-3">
          <AdminCardHeader>
            <AdminCardTitle className="text-lg">Arborescence du menu</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            {links.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucun lien. Ajoutez votre premier élément ci-contre.
              </p>
            ) : (
              <div className="divide-y">{renderTree(links)}</div>
            )}

            <div className="mt-8 border-t pt-6">
              <h3 className="text-sm font-semibold text-navy-900">Boutons CTA (en-tête)</h3>
              <p className="mt-1 text-xs text-slate-500">
                Boutons colorés à droite du menu, ex. S&apos;inscrire.
              </p>
              {buttons.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Aucun bouton configuré.</p>
              ) : (
                <div className="mt-4 divide-y">
                  {buttons.map((button) => (
                    <div
                      key={button.id}
                      className={cn(
                        "flex items-start justify-between gap-3 rounded-lg px-3 py-3 hover:bg-slate-50",
                        editingId === button.id && "bg-ocean-50/40"
                      )}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-navy-900">{button.labelFr}</p>
                          <span className="text-sm text-slate-500">({button.labelAr})</span>
                          <span className="rounded bg-ocean-600 px-2 py-0.5 text-[11px] font-medium text-white">
                            Bouton CTA
                          </span>
                          {renderStatusBadge(button.isPublished)}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {button.href}
                          {!button.isPublished && " · masqué sur le site public"}
                        </p>
                      </div>
                      {renderItemActions(button, () => loadEdit(button))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AdminCardContent>
        </AdminCard>

        {canWrite && (
          <AdminCard className="xl:col-span-2">
            <AdminCardHeader>
              <AdminCardTitle className="text-lg">
                {editingId ? "Modifier l'élément" : "Nouvel élément"}
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="navItemType">Type</Label>
                  <select
                    id="navItemType"
                    value={form.itemType}
                    onChange={(e) => {
                      const itemType = e.target.value as "LINK" | "BUTTON";
                      setForm({
                        ...form,
                        itemType,
                        location: itemType === "BUTTON" ? "HEADER" : form.location,
                        parentId: itemType === "BUTTON" ? "" : form.parentId,
                        exactMatch: itemType === "BUTTON" ? false : form.exactMatch,
                      });
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="LINK">Lien menu</option>
                    <option value="BUTTON">Bouton CTA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="navLabelFr">Titre (FR)</Label>
                  <Input
                    id="navLabelFr"
                    value={form.labelFr}
                    onChange={(e) => setForm({ ...form, labelFr: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="navLabelAr">Titre (AR)</Label>
                  <Input
                    id="navLabelAr"
                    value={form.labelAr}
                    onChange={(e) => setForm({ ...form, labelAr: e.target.value })}
                    required
                    dir="rtl"
                    className="text-right"
                  />
                </div>
                {form.itemType === "LINK" && publishedPages.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="navSitePage">Page CMS (optionnel)</Label>
                    <select
                      id="navSitePage"
                      defaultValue=""
                      onChange={(e) => {
                        const page = publishedPages.find((p) => p.id === e.target.value);
                        if (!page) return;
                        setForm({
                          ...form,
                          href: page.href,
                          labelFr: form.labelFr || page.titleFr,
                          labelAr: form.labelAr || page.titleAr,
                        });
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">— Choisir une page publiée —</option>
                      {publishedPages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.titleFr} ({page.href})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500">
                      Créez une page dans{" "}
                      <a href="/admin/pages" className="text-ocean-700 underline">
                        Pages CMS
                      </a>
                      .
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="navHref">Chemin URL</Label>
                  <Input
                    id="navHref"
                    value={form.href}
                    onChange={(e) => setForm({ ...form, href: e.target.value })}
                    placeholder="/pages/mon-slug"
                    required
                  />
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Accueil", href: "/" },
                      { label: "Présentation", href: "/pages/presentation" },
                      { label: "Mot du directeur", href: "/pages/mot-du-directeur" },
                      { label: "À propos (section)", href: "/#about" },
                      { label: "Formations", href: "/formations" },
                      { label: "Contact", href: "/contact" },
                    ].map((preset) => (
                      <button
                        key={preset.href}
                        type="button"
                        onClick={() => setForm({ ...form, href: preset.href })}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Section accueil « À propos » : <code className="text-ocean-700">/#about</code>{" "}
                    (pas le titre du menu). La locale (/fr, /ar) est ajoutée automatiquement.
                  </p>
                </div>
                {form.itemType === "LINK" && (
                <div className="space-y-2">
                  <Label htmlFor="navParent">Menu parent</Label>
                  <select
                    id="navParent"
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Aucun (menu principal)</option>
                    {parentOptions
                      .filter((item) => item.id !== editingId)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.labelFr}
                        </option>
                      ))}
                  </select>
                </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="navLocation">Emplacement</Label>
                    <select
                      id="navLocation"
                      value={form.location}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          location: e.target.value as "HEADER" | "FOOTER" | "BOTH",
                        })
                      }
                      disabled={form.itemType === "BUTTON"}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
                    >
                      <option value="HEADER">En-tête</option>
                      {form.itemType === "LINK" && (
                        <>
                          <option value="FOOTER">Pied de page</option>
                          <option value="BOTH">En-tête + pied</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="navOrder">Ordre</Label>
                    <Input
                      id="navOrder"
                      type="number"
                      min={0}
                      value={form.order}
                      onChange={(e) =>
                        setForm({ ...form, order: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <AdminPanel className="border-ocean-200/60 bg-gradient-to-r from-slate-50 to-white p-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Statut sur le site
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {renderStatusBadge(form.isPublished)}
                        <p className="text-sm text-slate-600">
                          {form.isPublished
                            ? "Visible dans le menu public (en-tête et/ou pied de page)."
                            : "Masqué — le lien n'apparaît pas sur le site."}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 rounded-xl border border-slate-200 bg-white p-1 shadow-sm self-start">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, isPublished: true }))}
                        className={cn(
                          "rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
                          form.isPublished
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, isPublished: false }))}
                        className={cn(
                          "rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
                          !form.isPublished
                            ? "bg-slate-700 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </AdminPanel>
                <div className="space-y-2">
                  {form.itemType === "LINK" && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.exactMatch}
                      onChange={(e) =>
                        setForm({ ...form, exactMatch: e.target.checked })
                      }
                    />
                    Correspondance exacte (pour l&apos;accueil)
                  </label>
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.openInNewTab}
                      onChange={(e) =>
                        setForm({ ...form, openInNewTab: e.target.checked })
                      }
                    />
                    Ouvrir dans un nouvel onglet
                  </label>
                </div>
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
