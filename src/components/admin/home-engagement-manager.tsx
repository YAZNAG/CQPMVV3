"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  HeartHandshake,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { AdminVideoUpload } from "@/components/admin/admin-video-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import {
  createHomeEngagementItem,
  deleteHomeEngagementItem,
  updateHomeEngagementItem,
  updateHomeEngagementSection,
} from "@/actions/admin/home-engagement.actions";
import type {
  HomeEngagementItemRecord,
  HomeEventRecord,
} from "@/services/home-engagement.service";
import { cn } from "@/lib/utils";

type SectionSettings = {
  homeEventsTitleFr: string;
  homeEventsTitleAr: string;
  homeEventsEmptyFr: string;
  homeEventsEmptyAr: string;
  homeEngagementTitleFr: string;
  homeEngagementTitleAr: string;
  homeEngagementBackgroundUrl: string;
  homeEngagementMediaUrl: string;
  homeEngagementMediaThumbnailUrl: string;
  homeContactBannerTitleFr: string;
  homeContactBannerTitleAr: string;
  homeContactBannerSubtitleFr: string;
  homeContactBannerSubtitleAr: string;
  homeContactBannerPhone: string;
  homeContactBannerHref: string;
  homeContactBannerBackgroundUrl: string;
};

const inputClass =
  "border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white focus-visible:ring-ocean-500/30";

interface HomeEngagementManagerProps {
  section: SectionSettings;
  engagementItems: HomeEngagementItemRecord[];
  events: HomeEventRecord[];
  sectionPublished: boolean;
  canWrite: boolean;
}

const defaultEngagementForm = (items: HomeEngagementItemRecord[]) => ({
  keywordFr: "",
  keywordAr: "",
  descriptionFr: "",
  descriptionAr: "",
  order: items.length,
  isPublished: true,
});

export function HomeEngagementManager({
  section,
  engagementItems,
  events,
  sectionPublished,
  canWrite,
}: HomeEngagementManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sectionForm, setSectionForm] = useState(section);
  const [editingEngagementId, setEditingEngagementId] = useState<string | null>(null);
  const [engagementForm, setEngagementForm] = useState(() =>
    defaultEngagementForm(engagementItems)
  );

  const handleSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const result = await updateHomeEngagementSection({
        ...sectionForm,
        homeEngagementBackgroundUrl: sectionForm.homeEngagementBackgroundUrl || null,
        homeEngagementMediaUrl: sectionForm.homeEngagementMediaUrl || null,
        homeEngagementMediaThumbnailUrl: sectionForm.homeEngagementMediaThumbnailUrl || null,
        homeContactBannerBackgroundUrl: sectionForm.homeContactBannerBackgroundUrl || null,
      });
      if (result.success) {
        toast.success("Section enregistrée");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleEngagementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const result = editingEngagementId
        ? await updateHomeEngagementItem({ id: editingEngagementId, ...engagementForm })
        : await createHomeEngagementItem(engagementForm);
      if (result.success) {
        toast.success(editingEngagementId ? "Point mis à jour" : "Point ajouté");
        setEditingEngagementId(null);
        setEngagementForm(defaultEngagementForm(engagementItems));
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const publishedEngagementCount = engagementItems.filter((i) => i.isPublished).length;
  const publishedEventsCount = events.filter((e) => e.isPublished).length;

  return (
    <div className="space-y-8">
      <AdminSectionToggleBanner
        sectionKey="engagement"
        initialPublished={sectionPublished}
        subtitle={`${publishedEngagementCount} point${publishedEngagementCount !== 1 ? "s" : ""} engagement actif${publishedEngagementCount !== 1 ? "s" : ""} — ${publishedEventsCount} événement${publishedEventsCount !== 1 ? "s" : ""} actif${publishedEventsCount !== 1 ? "s" : ""} — accueil`}
        canWrite={canWrite}
      />

      <form onSubmit={handleSectionSubmit}>
        <AdminPanel>
          <AdminPanelHeader
            icon={HeartHandshake}
            title="En-têtes & médias"
            description="Titres, vidéo YouTube ou fichier, image de fond et bannière contact."
          />
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-800">Événements</p>
              <AdminBilingualGrid>
                <AdminField
                  label="Titre (FR)"
                  value={sectionForm.homeEventsTitleFr}
                  onChange={(v) => setSectionForm((s) => ({ ...s, homeEventsTitleFr: v }))}
                />
                <AdminField
                  label="Titre (AR)"
                  value={sectionForm.homeEventsTitleAr}
                  onChange={(v) => setSectionForm((s) => ({ ...s, homeEventsTitleAr: v }))}
                  dir="rtl"
                />
                <AdminTextField
                  label="Message vide (FR)"
                  value={sectionForm.homeEventsEmptyFr}
                  onChange={(v) => setSectionForm((s) => ({ ...s, homeEventsEmptyFr: v }))}
                  rows={2}
                />
                <AdminTextField
                  label="Message vide (AR)"
                  value={sectionForm.homeEventsEmptyAr}
                  onChange={(v) => setSectionForm((s) => ({ ...s, homeEventsEmptyAr: v }))}
                  dir="rtl"
                  rows={2}
                />
              </AdminBilingualGrid>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-800">Engagement</p>
              <AdminBilingualGrid>
                <AdminField
                  label="Titre (FR)"
                  value={sectionForm.homeEngagementTitleFr}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeEngagementTitleFr: v }))
                  }
                />
                <AdminField
                  label="Titre (AR)"
                  value={sectionForm.homeEngagementTitleAr}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeEngagementTitleAr: v }))
                  }
                  dir="rtl"
                />
              </AdminBilingualGrid>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <AdminField
                  label="Image de fond (droite)"
                  value={sectionForm.homeEngagementBackgroundUrl}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeEngagementBackgroundUrl: v }))
                  }
                  hint="/images/... ou URL"
                />
                <div className="space-y-3 lg:col-span-2">
                  <AdminField
                    label="URL vidéo (YouTube ou /uploads/...)"
                    value={sectionForm.homeEngagementMediaUrl}
                    onChange={(v) =>
                      setSectionForm((s) => ({ ...s, homeEngagementMediaUrl: v }))
                    }
                    hint="Lien YouTube ou chemin après upload"
                  />
                  {canWrite && (
                    <AdminVideoUpload
                      folder="engagement"
                      onUploaded={(url) => {
                        setSectionForm((s) => ({ ...s, homeEngagementMediaUrl: url }));
                        toast.success("Vidéo téléversée");
                      }}
                      onError={(msg) => toast.error(msg)}
                    />
                  )}
                  {sectionForm.homeEngagementMediaUrl &&
                    sectionForm.homeEngagementMediaUrl.startsWith("/uploads/") && (
                      <video
                        src={sectionForm.homeEngagementMediaUrl}
                        controls
                        className="max-h-40 w-full rounded-lg border border-slate-200 bg-black"
                      />
                    )}
                </div>
                <AdminField
                  label="Miniature vidéo (optionnel)"
                  value={sectionForm.homeEngagementMediaThumbnailUrl}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeEngagementMediaThumbnailUrl: v }))
                  }
                />
              </div>
              {canWrite && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <AdminImageUpload
                    folder="engagement"
                    onUploaded={(url) => {
                      setSectionForm((s) => ({ ...s, homeEngagementBackgroundUrl: url }));
                      toast.success("Image téléversée");
                    }}
                    onError={(msg) => toast.error(msg)}
                  />
                  <AdminImageUpload
                    folder="engagement"
                    onUploaded={(url) => {
                      setSectionForm((s) => ({
                        ...s,
                        homeEngagementMediaThumbnailUrl: url,
                      }));
                      toast.success("Miniature téléversée");
                    }}
                    onError={(msg) => toast.error(msg)}
                  />
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Phone className="h-4 w-4 text-ocean-600" />
                Bannière contact (orange)
              </p>
              <AdminBilingualGrid>
                <AdminField
                  label="Titre (FR)"
                  value={sectionForm.homeContactBannerTitleFr}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeContactBannerTitleFr: v }))
                  }
                />
                <AdminField
                  label="Titre (AR)"
                  value={sectionForm.homeContactBannerTitleAr}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeContactBannerTitleAr: v }))
                  }
                  dir="rtl"
                />
                <AdminField
                  label="Sous-titre bouton (FR)"
                  value={sectionForm.homeContactBannerSubtitleFr}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeContactBannerSubtitleFr: v }))
                  }
                />
                <AdminField
                  label="Sous-titre bouton (AR)"
                  value={sectionForm.homeContactBannerSubtitleAr}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeContactBannerSubtitleAr: v }))
                  }
                  dir="rtl"
                />
              </AdminBilingualGrid>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <AdminField
                  label="Téléphone affiché"
                  value={sectionForm.homeContactBannerPhone}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeContactBannerPhone: v }))
                  }
                />
                <AdminField
                  label="Lien contact"
                  value={sectionForm.homeContactBannerHref}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeContactBannerHref: v }))
                  }
                  hint="/contact"
                />
                <AdminField
                  label="Image fond bannière (optionnel)"
                  value={sectionForm.homeContactBannerBackgroundUrl}
                  onChange={(v) =>
                    setSectionForm((s) => ({ ...s, homeContactBannerBackgroundUrl: v }))
                  }
                />
              </div>
            </div>
          </div>
          {canWrite && (
            <AdminFormFooter>
              <Button type="submit" variant="ocean" disabled={isPending}>
                Enregistrer la section
              </Button>
            </AdminFormFooter>
          )}
        </AdminPanel>
      </form>

      <div className="grid gap-8 xl:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader
            icon={Check}
            title="Points d'engagement"
            description="Liste avec coches orange sur la page d'accueil."
          />
          {engagementItems.length === 0 ? (
            <AdminEmptyState>Aucun point. Ajoutez votre premier engagement.</AdminEmptyState>
          ) : (
            <ul className="mb-6 space-y-2">
              {engagementItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{item.keywordFr}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                      {item.descriptionFr}
                    </p>
                  </div>
                  {canWrite && (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingEngagementId(item.id);
                          setEngagementForm({
                            keywordFr: item.keywordFr,
                            keywordAr: item.keywordAr,
                            descriptionFr: item.descriptionFr,
                            descriptionAr: item.descriptionAr,
                            order: item.order,
                            isPublished: item.isPublished,
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => {
                          if (!confirm("Supprimer ce point ?")) return;
                          startTransition(async () => {
                            const result = await deleteHomeEngagementItem(item.id);
                            if (result.success) {
                              toast.success("Supprimé");
                              router.refresh();
                            } else toast.error(result.error ?? "Erreur");
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
          {canWrite && (
            <form onSubmit={handleEngagementSubmit} className="space-y-4 border-t border-slate-100 pt-5">
              <p className="text-sm font-semibold text-slate-800">
                {editingEngagementId ? "Modifier le point" : "Nouveau point"}
              </p>
              <AdminBilingualGrid>
                <AdminField
                  label="Mot-clé (FR)"
                  value={engagementForm.keywordFr}
                  onChange={(v) => setEngagementForm((f) => ({ ...f, keywordFr: v }))}
                />
                <AdminField
                  label="Mot-clé (AR)"
                  value={engagementForm.keywordAr}
                  onChange={(v) => setEngagementForm((f) => ({ ...f, keywordAr: v }))}
                  dir="rtl"
                />
                <AdminTextField
                  label="Description (FR)"
                  value={engagementForm.descriptionFr}
                  onChange={(v) => setEngagementForm((f) => ({ ...f, descriptionFr: v }))}
                  rows={3}
                />
                <AdminTextField
                  label="Description (AR)"
                  value={engagementForm.descriptionAr}
                  onChange={(v) => setEngagementForm((f) => ({ ...f, descriptionAr: v }))}
                  dir="rtl"
                  rows={3}
                />
              </AdminBilingualGrid>
              <div className="flex flex-wrap gap-3">
                <Input
                  type="number"
                  min={0}
                  value={engagementForm.order}
                  onChange={(e) =>
                    setEngagementForm((f) => ({ ...f, order: Number(e.target.value) }))
                  }
                  className={cn("w-24", inputClass)}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={engagementForm.isPublished}
                    onChange={(e) =>
                      setEngagementForm((f) => ({ ...f, isPublished: e.target.checked }))
                    }
                  />
                  Publié
                </label>
                <Button type="submit" variant="ocean" size="sm" disabled={isPending}>
                  {editingEngagementId ? "Mettre à jour" : "Ajouter"}
                </Button>
                {editingEngagementId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingEngagementId(null);
                      setEngagementForm(defaultEngagementForm(engagementItems));
                    }}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            icon={CalendarDays}
            title="Événements & activités"
            description="Gérez l'agenda depuis la page dédiée."
            actions={
              <Button variant="ocean" size="sm" asChild>
                <Link href="/admin/events">Gérer les événements</Link>
              </Button>
            }
          />
          <p className="text-sm text-slate-600">
            {events.length === 0
              ? "Aucun événement pour le moment."
              : `${events.length} événement(s) — affichés sur /fr/events et l'accueil.`}
          </p>
        </AdminPanel>
      </div>
    </div>
  );
}
