"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ExternalLink, ImageIcon, Trash2, UserCircle } from "lucide-react";
import { updateDirectorMessage } from "@/actions/admin/director-message.actions";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { AdminSectionToggleBanner } from "@/components/admin/admin-section-toggle-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ABOUT_PAGE_SLUGS } from "@/lib/about-pages";

export type DirectorMessageSettings = {
  directorPhotoUrl: string | null;
  directorQuoteFr: string | null;
  directorQuoteAr: string | null;
  directorBodyFr: string | null;
  directorBodyAr: string | null;
  directorNameFr: string | null;
  directorNameAr: string | null;
  directorTitleFr: string | null;
  directorTitleAr: string | null;
  directorMessagePublished: boolean;
};

interface DirectorMessageManagerProps {
  settings: DirectorMessageSettings;
  canWrite: boolean;
}

export function DirectorMessageManager({ settings, canWrite }: DirectorMessageManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [directorPhotoUrl, setDirectorPhotoUrl] = useState(settings.directorPhotoUrl ?? "");
  const [directorMessagePublished, setDirectorMessagePublished] = useState(
    settings.directorMessagePublished
  );

  useEffect(() => {
    setDirectorMessagePublished(settings.directorMessagePublished);
  }, [settings.directorMessagePublished]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canWrite) return;

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    startTransition(async () => {
      const result = await updateDirectorMessage(payload);
      if (result.success) {
        toast.success("Mot du directeur enregistré");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <AdminSectionToggleBanner
        sectionKey="director"
        initialPublished={settings.directorMessagePublished}
        subtitle="Accueil & page mot du directeur"
        canWrite={canWrite}
      />

    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminPanel>
        <AdminPanelHeader
          icon={UserCircle}
          title="Mot du directeur"
          description="Section accueil + page /pages/mot-du-directeur — citation, photo et titre."
        />
        <p className="mb-4 text-sm text-slate-600">
          Page publique :{" "}
          <Link
            href={`/fr/pages/${ABOUT_PAGE_SLUGS.director}`}
            target="_blank"
            className="inline-flex items-center gap-1 font-medium text-ocean-700 hover:underline"
          >
            /fr/pages/{ABOUT_PAGE_SLUGS.director}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </p>

        <input
          type="hidden"
          name="directorMessagePublished"
          value={directorMessagePublished ? "true" : "false"}
        />
        <input type="hidden" name="directorPhotoUrl" value={directorPhotoUrl} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 rounded-xl border border-ocean-100 bg-ocean-50/30 p-4">
            <p className="text-sm font-semibold text-navy-900">Citation — page d&apos;accueil</p>
            <p className="mt-1 text-xs text-slate-600">
              Texte court affiché dans le bandeau sombre sous « À propos ».
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="directorQuoteFr">Citation (FR)</Label>
            <Textarea
              id="directorQuoteFr"
              name="directorQuoteFr"
              defaultValue={settings.directorQuoteFr ?? ""}
              rows={4}
              placeholder="Au CQPM Nador, nous nous engageons à fournir une formation technique de haut niveau…"
              className="mt-1.5 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="directorQuoteAr">Citation (AR)</Label>
            <Textarea
              id="directorQuoteAr"
              name="directorQuoteAr"
              defaultValue={settings.directorQuoteAr ?? ""}
              rows={4}
              dir="rtl"
              className="mt-1.5 border-slate-200 bg-slate-50/50 text-right focus-visible:bg-white"
            />
          </div>

          <div className="sm:col-span-2 rounded-xl border border-sky-100 bg-sky-50/40 p-4">
            <p className="text-sm font-semibold text-navy-900">Message détaillé — page Mot du Directeur</p>
            <p className="mt-1 text-xs text-slate-600">
              Un paragraphe par bloc (ligne vide entre chaque). Le dernier paragraphe s&apos;affiche en gras.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="directorBodyFr">Détails du message (FR)</Label>
            <Textarea
              id="directorBodyFr"
              name="directorBodyFr"
              defaultValue={settings.directorBodyFr ?? ""}
              rows={12}
              placeholder={"Paragraphe 1…\n\nParagraphe 2…\n\nPhrase de conclusion en gras…"}
              className="mt-1.5 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="directorBodyAr">Détails du message (AR)</Label>
            <Textarea
              id="directorBodyAr"
              name="directorBodyAr"
              defaultValue={settings.directorBodyAr ?? ""}
              rows={12}
              dir="rtl"
              className="mt-1.5 border-slate-200 bg-slate-50/50 text-right focus-visible:bg-white"
            />
          </div>
          <div>
            <Label htmlFor="directorNameFr">Nom du directeur (FR)</Label>
            <Input
              id="directorNameFr"
              name="directorNameFr"
              defaultValue={settings.directorNameFr ?? ""}
              className="mt-1.5 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
            />
          </div>
          <div>
            <Label htmlFor="directorNameAr">Nom du directeur (AR)</Label>
            <Input
              id="directorNameAr"
              name="directorNameAr"
              defaultValue={settings.directorNameAr ?? ""}
              dir="rtl"
              className="mt-1.5 border-slate-200 bg-slate-50/50 text-right focus-visible:bg-white"
            />
          </div>
          <div>
            <Label htmlFor="directorTitleFr">Titre / fonction (FR)</Label>
            <Input
              id="directorTitleFr"
              name="directorTitleFr"
              defaultValue={settings.directorTitleFr ?? ""}
              placeholder="Directeur du CQPM Nador"
              className="mt-1.5 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
            />
          </div>
          <div>
            <Label htmlFor="directorTitleAr">Titre / fonction (AR)</Label>
            <Input
              id="directorTitleAr"
              name="directorTitleAr"
              defaultValue={settings.directorTitleAr ?? ""}
              dir="rtl"
              placeholder="مدير مركز التأهيل المهني البحري بالناظور"
              className="mt-1.5 border-slate-200 bg-slate-50/50 text-right focus-visible:bg-white"
            />
          </div>

          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-ocean-600" />
              <p className="text-sm font-semibold text-slate-900">Photo du directeur</p>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Portrait rond au-dessus de la citation. Format carré recommandé.
            </p>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ocean-200 bg-white shadow-sm">
                {directorPhotoUrl ? (
                  <img
                    src={directorPhotoUrl}
                    alt="Photo directeur"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-12 w-12 text-slate-300" />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="directorPhotoUrlInput">Chemin ou URL</Label>
                  <Input
                    id="directorPhotoUrlInput"
                    value={directorPhotoUrl}
                    onChange={(e) => setDirectorPhotoUrl(e.target.value)}
                    placeholder="/uploads/director/photo.jpg"
                    className="mt-1.5 border-slate-200 bg-white"
                    disabled={!canWrite}
                  />
                </div>
                {canWrite && (
                  <div className="flex flex-wrap gap-2">
                    <div className="min-w-[12rem] flex-1">
                      <AdminImageUpload
                        folder="director"
                        onUploaded={(url) => {
                          setDirectorPhotoUrl(url);
                          toast.success("Photo téléversée — cliquez Enregistrer");
                        }}
                        onError={(msg) => toast.error(msg)}
                      />
                    </div>
                    {directorPhotoUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setDirectorPhotoUrl("");
                          toast.message("Photo retirée — enregistrez pour appliquer");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Retirer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminPanel>

      {canWrite && (
        <Button type="submit" variant="ocean" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer le mot du directeur"}
        </Button>
      )}
    </form>
    </div>
  );
}
