"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AdminBilingualGrid,
  AdminField,
  AdminFormFooter,
  AdminTextField,
} from "@/components/admin/admin-form-fields";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-panel";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import {
  toggleFormationShowOnHome,
  updateHomeFormationsSection,
} from "@/actions/admin/home-formation-showcase.actions";
import type { AdminHomeFormationItem } from "@/services/home-formation-showcase.service";
import { cn } from "@/lib/utils";

type SectionSettings = {
  homeFormationsTitleFr: string;
  homeFormationsTitleAr: string;
  homeFormationsSubtitleFr: string;
  homeFormationsSubtitleAr: string;
  homeFormationsCtaLabelFr: string;
  homeFormationsCtaLabelAr: string;
  homeFormationsCtaHref: string;
};

interface HomeFormationsManagerProps {
  formations: AdminHomeFormationItem[];
  section: SectionSettings;
  sectionPublished: boolean;
  canWrite: boolean;
}

export function HomeFormationsManager({
  formations,
  section,
  sectionPublished,
  canWrite,
}: HomeFormationsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sectionForm, setSectionForm] = useState(section);

  const featuredCount = formations.filter((f) => f.showOnHome).length;
  const visibleCount = formations.filter((f) => f.isVisibleOnHome).length;

  const grouped = formations.reduce<Record<string, AdminHomeFormationItem[]>>((acc, item) => {
    const key = item.categoryNameFr;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handleSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    startTransition(async () => {
      const result = await updateHomeFormationsSection(sectionForm);
      if (result.success) {
        toast.success("En-tête de section enregistré");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const handleToggleShowOnHome = (formation: AdminHomeFormationItem) => {
    if (!canWrite) return;

    const nextShowOnHome = !formation.showOnHome;
    startTransition(async () => {
      const result = await toggleFormationShowOnHome({
        id: formation.id,
        showOnHome: nextShowOnHome,
      });
      if (result.success) {
        toast.success(
          nextShowOnHome
            ? `"${formation.titleFr}" ajoutée à l'accueil`
            : `"${formation.titleFr}" retirée de l'accueil`
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const getStatusHint = (formation: AdminHomeFormationItem) => {
    if (!formation.showOnHome) {
      return "Non affichée sur l'accueil.";
    }
    if (!formation.isPublished) {
      return "Sélectionnée mais masquée — la formation est inactive.";
    }
    return "Visible sur la page d'accueil.";
  };

  return (
    <div className="space-y-8">
      <AdminSectionToggleBanner
        sectionKey="formations"
        initialPublished={sectionPublished}
        publishedCount={visibleCount}
        totalCount={formations.length}
        itemLabel="formation"
        locations="accueil"
        canWrite={canWrite}
      />

      <form onSubmit={handleSectionSubmit}>
        <AdminPanel>
          <AdminPanelHeader
            icon={Layers}
            title="En-tête de la section"
            description="Titre, sous-titre et bouton « Voir tout » affichés au-dessus des cartes formations."
          />
          <AdminBilingualGrid>
            <AdminField
              label="Titre (FR)"
              value={sectionForm.homeFormationsTitleFr}
              onChange={(v) => setSectionForm((s) => ({ ...s, homeFormationsTitleFr: v }))}
            />
            <AdminField
              label="Titre (AR)"
              value={sectionForm.homeFormationsTitleAr}
              onChange={(v) => setSectionForm((s) => ({ ...s, homeFormationsTitleAr: v }))}
              dir="rtl"
            />
            <AdminTextField
              label="Sous-titre (FR)"
              value={sectionForm.homeFormationsSubtitleFr}
              onChange={(v) => setSectionForm((s) => ({ ...s, homeFormationsSubtitleFr: v }))}
              className="sm:col-span-2"
            />
            <AdminTextField
              label="Sous-titre (AR)"
              value={sectionForm.homeFormationsSubtitleAr}
              onChange={(v) => setSectionForm((s) => ({ ...s, homeFormationsSubtitleAr: v }))}
              className="sm:col-span-2"
              dir="rtl"
            />
            <AdminField
              label="Bouton (FR)"
              value={sectionForm.homeFormationsCtaLabelFr}
              onChange={(v) => setSectionForm((s) => ({ ...s, homeFormationsCtaLabelFr: v }))}
            />
            <AdminField
              label="Bouton (AR)"
              value={sectionForm.homeFormationsCtaLabelAr}
              onChange={(v) => setSectionForm((s) => ({ ...s, homeFormationsCtaLabelAr: v }))}
              dir="rtl"
            />
            <AdminField
              label="Lien du bouton"
              value={sectionForm.homeFormationsCtaHref}
              onChange={(v) => setSectionForm((s) => ({ ...s, homeFormationsCtaHref: v }))}
              className="sm:col-span-2"
              placeholder="/formations"
            />
          </AdminBilingualGrid>
          {canWrite && (
            <AdminFormFooter>
              <Button type="submit" variant="ocean" disabled={isPending}>
                Enregistrer l&apos;en-tête
              </Button>
            </AdminFormFooter>
          )}
        </AdminPanel>
      </form>

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>
            Formations à afficher ({visibleCount} visible{visibleCount !== 1 ? "s" : ""} /{" "}
            {featuredCount} sélectionnée{featuredCount !== 1 ? "s" : ""})
          </AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <AdminPanelHeader
            icon={GraduationCap}
            title="Sélection depuis le catalogue"
            description="Choisissez les formations existantes à mettre en avant sur l'accueil. Le contenu (titre, description, image) provient de chaque fiche formation."
            className="mb-6 border-0 pb-0"
          />

          {formations.length === 0 ? (
            <AdminEmptyState>
              Aucune formation dans le catalogue — créez des formations d&apos;abord.
            </AdminEmptyState>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([categoryName, items]) => (
                <div key={categoryName}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {categoryName}
                  </h3>
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                    {items.map((formation) => (
                      <li
                        key={formation.id}
                        className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">{formation.titleFr}</p>
                            <Badge
                              className={cn(
                                "px-2 py-0.5 text-[10px] uppercase tracking-wide",
                                formation.isVisibleOnHome
                                  ? "bg-emerald-100 text-emerald-800"
                                  : formation.showOnHome
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-200 text-slate-700"
                              )}
                            >
                              {formation.isVisibleOnHome
                                ? "Active"
                                : formation.showOnHome
                                  ? "En attente"
                                  : "Inactive"}
                            </Badge>
                            {!formation.isPublished && (
                              <Badge className="bg-slate-200 text-slate-700">
                                Formation inactive
                              </Badge>
                            )}
                          </div>
                          <p className="truncate text-sm text-slate-500">
                            {formation.slug} · {formation.durationFr}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{getStatusHint(formation)}</p>
                        </div>
                        {canWrite && (
                          <Button
                            type="button"
                            variant={formation.showOnHome ? "outline" : "ocean"}
                            size="sm"
                            className={cn(
                              "shrink-0",
                              formation.showOnHome && "border-slate-200"
                            )}
                            onClick={() => handleToggleShowOnHome(formation)}
                            disabled={isPending}
                          >
                            {formation.showOnHome ? "Retirer de l'accueil" : "Afficher sur l'accueil"}
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
