"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileStack,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  AdminSectionToggleBanner,
} from "@/components/admin/admin-section-toggle-banner";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
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
import {
  createDownloadResource,
  deleteDownloadResource,
  updateDownloadResource,
  updateDownloadsSection,
} from "@/actions/admin/download.actions";
import type { DownloadResourceRecord } from "@/services/download.service";
import { downloadResourceHref } from "@/services/download.service";
import { cn } from "@/lib/utils";

const inputClass =
  "border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white focus-visible:ring-ocean-500/30";

type SectionSettings = {
  downloadsSectionTitleFr: string;
  downloadsSectionTitleAr: string;
  downloadsSectionSubtitleFr: string;
  downloadsSectionSubtitleAr: string;
  downloadsSectionPublished: boolean;
};

const defaultItemForm = (items: DownloadResourceRecord[]) => ({
  slug: "",
  titleFr: "",
  titleAr: "",
  infoLabelFr: "",
  infoLabelAr: "",
  excerptFr: "",
  excerptAr: "",
  contentFr: "<p></p>",
  contentAr: "<p></p>",
  icon: "PDF" as const,
  actionType: "DOWNLOAD" as const,
  fileUrl: "",
  order: items.length,
  isPublished: true,
});

interface DownloadsManagerProps {
  items: DownloadResourceRecord[];
  section: SectionSettings;
  canWrite: boolean;
}

export function DownloadsManager({ items, section, canWrite }: DownloadsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState(section);
  const [form, setForm] = useState(() => defaultItemForm(items));

  const publishedCount = items.filter((i) => i.isPublished).length;

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultItemForm(items));
  };

  const loadItem = (item: DownloadResourceRecord) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      titleFr: item.titleFr,
      titleAr: item.titleAr,
      infoLabelFr: item.infoLabelFr ?? "",
      infoLabelAr: item.infoLabelAr ?? "",
      excerptFr: item.excerptFr ?? "",
      excerptAr: item.excerptAr ?? "",
      contentFr: item.contentFr,
      contentAr: item.contentAr,
      icon: item.icon,
      actionType: item.actionType,
      fileUrl: item.fileUrl ?? "",
      order: item.order,
      isPublished: item.isPublished,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const result = await updateDownloadsSection({
        downloadsSectionTitleFr: sectionForm.downloadsSectionTitleFr,
        downloadsSectionTitleAr: sectionForm.downloadsSectionTitleAr,
        downloadsSectionSubtitleFr: sectionForm.downloadsSectionSubtitleFr,
        downloadsSectionSubtitleAr: sectionForm.downloadsSectionSubtitleAr,
        downloadsSectionPublished: section.downloadsSectionPublished,
      });
      if (result.success) {
        toast.success("Section mise à jour");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const saveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    startTransition(async () => {
      const payload = {
        ...form,
        infoLabelFr: form.infoLabelFr || null,
        infoLabelAr: form.infoLabelAr || null,
        excerptFr: form.excerptFr || null,
        excerptAr: form.excerptAr || null,
        fileUrl: form.fileUrl || null,
      };

      const result = editingId
        ? await updateDownloadResource({ id: editingId, ...payload })
        : await createDownloadResource(payload);

      if (result.success) {
        toast.success(editingId ? "Document mis à jour" : "Document ajouté");
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const toggleItemPublished = (item: DownloadResourceRecord) => {
    if (!canWrite) return;
    startTransition(async () => {
      const result = await updateDownloadResource({
        id: item.id,
        slug: item.slug,
        titleFr: item.titleFr,
        titleAr: item.titleAr,
        infoLabelFr: item.infoLabelFr,
        infoLabelAr: item.infoLabelAr,
        excerptFr: item.excerptFr,
        excerptAr: item.excerptAr,
        contentFr: item.contentFr,
        contentAr: item.contentAr,
        icon: item.icon,
        actionType: item.actionType,
        fileUrl: item.fileUrl,
        order: item.order,
        isPublished: !item.isPublished,
      });
      if (result.success) {
        toast.success(item.isPublished ? "Carte désactivée" : "Carte activée");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    startTransition(async () => {
      const result = await deleteDownloadResource(id);
      if (result.success) {
        toast.success("Document supprimé");
        if (editingId === id) resetForm();
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <div className="space-y-8">
      <AdminSectionToggleBanner
        sectionKey="downloads"
        initialPublished={section.downloadsSectionPublished}
        publishedCount={publishedCount}
        totalCount={items.length}
        itemLabel="carte"
        locations="accueil & présentation"
        canWrite={canWrite}
      />

      <AdminPanel>
        <AdminPanelHeader
          icon={FileStack}
          title="Paramètres de la section"
          description="Titre et sous-titre affichés sur l'accueil, la présentation et /telechargements."
        />
        <form onSubmit={saveSection} className="space-y-4">
          <AdminBilingualGrid>
            <AdminField
              label="Titre section (FR)"
              value={sectionForm.downloadsSectionTitleFr}
              onChange={(v) => setSectionForm((s) => ({ ...s, downloadsSectionTitleFr: v }))}
              required
              disabled={!canWrite}
            />
            <AdminField
              label="Titre section (AR)"
              value={sectionForm.downloadsSectionTitleAr}
              onChange={(v) => setSectionForm((s) => ({ ...s, downloadsSectionTitleAr: v }))}
              dir="rtl"
              required
              disabled={!canWrite}
            />
            <AdminTextField
              label="Sous-titre (FR)"
              value={sectionForm.downloadsSectionSubtitleFr}
              onChange={(v) => setSectionForm((s) => ({ ...s, downloadsSectionSubtitleFr: v }))}
              rows={2}
              disabled={!canWrite}
            />
            <AdminTextField
              label="Sous-titre (AR)"
              value={sectionForm.downloadsSectionSubtitleAr}
              onChange={(v) => setSectionForm((s) => ({ ...s, downloadsSectionSubtitleAr: v }))}
              dir="rtl"
              rows={2}
              disabled={!canWrite}
            />
          </AdminBilingualGrid>
          {canWrite && (
            <Button type="submit" disabled={isPending}>
              Enregistrer les textes
            </Button>
          )}
        </form>
      </AdminPanel>

      <div className="grid gap-8 xl:grid-cols-5">
        <AdminPanel className="xl:col-span-2">
          <AdminPanelHeader
            icon={editingId ? Pencil : Plus}
            title={editingId ? "Modifier la carte" : "Ajouter une carte"}
            description="Chaque carte ouvre une page dédiée avec contenu et fichier."
          />
          {canWrite ? (
            <form onSubmit={saveItem} className="space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Slug URL
                </label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                  placeholder="avis-concours"
                  className={inputClass}
                  required
                />
                <p className="mt-1 text-xs text-slate-400">/fr/telechargements/{form.slug || "…"}</p>
              </div>

              <AdminBilingualGrid>
                <AdminField
                  label="Titre carte (FR)"
                  value={form.titleFr}
                  onChange={(v) => setForm((f) => ({ ...f, titleFr: v }))}
                  required
                />
                <AdminField
                  label="Titre carte (AR)"
                  value={form.titleAr}
                  onChange={(v) => setForm((f) => ({ ...f, titleAr: v }))}
                  dir="rtl"
                  required
                />
                <AdminField
                  label="Sous-texte carte (FR)"
                  value={form.infoLabelFr}
                  onChange={(v) => setForm((f) => ({ ...f, infoLabelFr: v }))}
                  placeholder="Dernière mise à jour : 02/06/2024"
                />
                <AdminField
                  label="Sous-texte carte (AR)"
                  value={form.infoLabelAr}
                  onChange={(v) => setForm((f) => ({ ...f, infoLabelAr: v }))}
                  dir="rtl"
                />
              </AdminBilingualGrid>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Icône
                  </label>
                  <select
                    value={form.icon}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        icon: e.target.value as typeof form.icon,
                      }))
                    }
                    className={`${inputClass} h-11 w-full rounded-md border px-3 text-sm`}
                  >
                    <option value="PDF">PDF (rouge)</option>
                    <option value="SUCCESS">Validé (vert)</option>
                    <option value="FOLDER">Dossier (bleu)</option>
                    <option value="RULES">Règlement (orange)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Lien carte
                  </label>
                  <select
                    value={form.actionType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        actionType: e.target.value as typeof form.actionType,
                      }))
                    }
                    className={`${inputClass} h-11 w-full rounded-md border px-3 text-sm`}
                  >
                    <option value="DOWNLOAD">Télécharger</option>
                    <option value="VIEW">Consulter</option>
                  </select>
                </div>
              </div>

              <AdminField
                label="Fichier PDF (URL ou /uploads/...)"
                value={form.fileUrl}
                onChange={(v) => setForm((f) => ({ ...f, fileUrl: v }))}
                placeholder="/uploads/documents/avis.pdf"
              />
              <AdminImageUpload
                folder="documents"
                onUploaded={(url) => {
                  setForm((f) => ({ ...f, fileUrl: url }));
                  toast.success("Fichier téléversé");
                }}
                onError={(msg) => toast.error(msg)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ordre
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))
                    }
                    className={inputClass}
                  />
                </div>
                <label className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Carte active sur le site</span>
                </label>
              </div>

              <details className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Contenu de la page détail (optionnel)
                </summary>
                <div className="mt-4 space-y-4">
                  <AdminBilingualGrid>
                    <AdminTextField
                      label="Résumé page (FR)"
                      value={form.excerptFr}
                      onChange={(v) => setForm((f) => ({ ...f, excerptFr: v }))}
                      rows={2}
                    />
                    <AdminTextField
                      label="Résumé page (AR)"
                      value={form.excerptAr}
                      onChange={(v) => setForm((f) => ({ ...f, excerptAr: v }))}
                      dir="rtl"
                      rows={2}
                    />
                  </AdminBilingualGrid>
                  <RichTextEditor
                    value={form.contentFr}
                    onChange={(contentFr) => setForm((f) => ({ ...f, contentFr }))}
                  />
                  <RichTextEditor
                    value={form.contentAr}
                    onChange={(contentAr) => setForm((f) => ({ ...f, contentAr }))}
                  />
                </div>
              </details>

              <AdminFormFooter>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isPending}>
                    Annuler
                  </Button>
                )}
                <Button type="submit" disabled={isPending}>
                  {editingId ? "Enregistrer" : "Ajouter la carte"}
                </Button>
              </AdminFormFooter>
            </form>
          ) : (
            <p className="text-sm text-slate-500">Lecture seule.</p>
          )}
        </AdminPanel>

        <AdminPanel className="xl:col-span-3">
          <AdminPanelHeader
            icon={Download}
            title={`Cartes (${publishedCount} / ${items.length} actives)`}
            description="Activez ou désactivez chaque carte sans la supprimer."
          />
          {items.length === 0 ? (
            <AdminEmptyState message="Aucune carte. Utilisez le formulaire à gauche pour en ajouter." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex flex-wrap items-center gap-3 py-4",
                    !item.isPublished && "opacity-60"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{item.titleFr}</p>
                      <Badge variant={item.isPublished ? "default" : "ocean"}>
                        {item.isPublished ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="navy">
                        {item.actionType === "DOWNLOAD" ? "Télécharger" : "Consulter"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.infoLabelFr}</p>
                    <Link
                      href={`/fr${downloadResourceHref(item.slug)}`}
                      target="_blank"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-ocean-600 hover:underline"
                    >
                      Voir la page publique
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  {canWrite && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={item.isPublished ? "outline" : "default"}
                        onClick={() => toggleItemPublished(item)}
                        disabled={isPending}
                      >
                        {item.isPublished ? (
                          <>
                            <EyeOff className="mr-1.5 h-4 w-4" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1.5 h-4 w-4" />
                            Activer
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => loadItem(item)}
                        disabled={isPending}
                      >
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Modifier
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
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
        </AdminPanel>
      </div>
    </div>
  );
}
