"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSiteSettings } from "@/actions/admin/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Globe, ImageIcon, Info, Phone, Trash2, UserCircle } from "lucide-react";
import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";

interface SettingsFormProps {
  settings: {
    siteNameFr: string;
    siteNameAr: string;
    logoUrl: string | null;
    email: string | null;
    phone: string | null;
    addressFr: string | null;
    addressAr: string | null;
    aboutImageUrl: string | null;
    aboutPresentationFr: string | null;
    aboutPresentationAr: string | null;
    missionFr: string | null;
    missionAr: string | null;
  };
  canWrite: boolean;
}

export function SettingsForm({ settings, canWrite }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");
  const [aboutImageUrl, setAboutImageUrl] = useState(settings.aboutImageUrl ?? "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    startTransition(async () => {
      const result = await updateSiteSettings(payload);
      if (result.success) {
        toast.success("Paramètres enregistrés");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      <AdminPanel>
        <AdminPanelHeader
          icon={Globe}
          title="Identité"
          description="Nom du site, logo (navbar et pied de page). Titre du bandeau → Hero / Slider."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom du site (FR)" name="siteNameFr" defaultValue={settings.siteNameFr} />
          <Field label="Nom du site (AR)" name="siteNameAr" defaultValue={settings.siteNameAr} dir="rtl" />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-ocean-600" />
            <p className="text-sm font-semibold text-slate-900">Logo du site</p>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Affiché dans la barre de navigation et le pied de page. Format carré ou horizontal recommandé (PNG avec fond transparent).
          </p>

          <input type="hidden" name="logoUrl" value={logoUrl} />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%,transparent_75%,#e2e8f0_75%,#e2e8f0),linear-gradient(45deg,#e2e8f0_25%,transparent_25%,transparent_75%,#e2e8f0_75%,#e2e8f0)] bg-[length:12px_12px] bg-[position:0_0,6px_6px] shadow-sm">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo actuel" className="h-full w-full object-contain p-2" />
              ) : (
                <span className="text-center text-xs text-slate-400">Aucun logo</span>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="logoUrlInput">Chemin ou URL</Label>
                <Input
                  id="logoUrlInput"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/uploads/site/logo.png"
                  className="mt-1.5 border-slate-200 bg-white"
                  disabled={!canWrite}
                />
              </div>
              {canWrite && (
                <div className="flex flex-wrap gap-2">
                  <div className="min-w-[12rem] flex-1">
                    <AdminImageUpload
                      folder="site"
                      onUploaded={(url) => {
                        setLogoUrl(url);
                        toast.success("Logo téléversé");
                      }}
                      onError={(msg) => toast.error(msg)}
                    />
                  </div>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setLogoUrl("");
                        toast.message("Logo retiré — enregistrez pour appliquer");
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
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader icon={Phone} title="Contact" description="Coordonnées affichées dans le pied de page et la page contact." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" defaultValue={settings.email ?? ""} />
          <Field label="Téléphone" name="phone" defaultValue={settings.phone ?? ""} />
          <Field label="Adresse (FR)" name="addressFr" defaultValue={settings.addressFr ?? ""} className="sm:col-span-2" />
          <Field label="Adresse (AR)" name="addressAr" defaultValue={settings.addressAr ?? ""} className="sm:col-span-2" dir="rtl" />
        </div>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelHeader
          icon={Info}
          title="Section À propos"
          description="Contenu des onglets Présentation et Missions. Pour les missions, une ligne = une puce."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextAreaField
            label="Présentation (FR)"
            name="aboutPresentationFr"
            defaultValue={settings.aboutPresentationFr ?? ""}
            className="sm:col-span-2"
          />
          <TextAreaField
            label="Présentation (AR)"
            name="aboutPresentationAr"
            defaultValue={settings.aboutPresentationAr ?? ""}
            className="sm:col-span-2"
            dir="rtl"
          />
          <TextAreaField
            label="Missions (FR)"
            name="missionFr"
            defaultValue={settings.missionFr ?? ""}
            className="sm:col-span-2"
            rows={5}
          />
          <TextAreaField
            label="Missions (AR)"
            name="missionAr"
            defaultValue={settings.missionAr ?? ""}
            className="sm:col-span-2"
            dir="rtl"
            rows={5}
          />
          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-ocean-600" />
              <p className="text-sm font-semibold text-slate-900">Image section À propos</p>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Photo affichée à côté des onglets Présentation / Missions sur la page d&apos;accueil.
            </p>

            <input type="hidden" name="aboutImageUrl" value={aboutImageUrl} />

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:h-32 sm:w-48">
                {aboutImageUrl ? (
                  <img
                    src={aboutImageUrl}
                    alt="Image À propos"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-center text-xs text-slate-400">
                    Aucune image
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="aboutImageUrlInput">Chemin ou URL</Label>
                  <Input
                    id="aboutImageUrlInput"
                    value={aboutImageUrl}
                    onChange={(e) => setAboutImageUrl(e.target.value)}
                    placeholder="/images/about-cqpm-nador.jpg"
                    className="mt-1.5 border-slate-200 bg-white"
                    disabled={!canWrite}
                  />
                </div>
                {canWrite && (
                  <div className="flex flex-wrap gap-2">
                    <div className="min-w-[12rem] flex-1">
                      <AdminImageUpload
                        folder="about"
                        onUploaded={(url) => {
                          setAboutImageUrl(url);
                          toast.success("Image téléversée");
                        }}
                        onError={(msg) => toast.error(msg)}
                      />
                    </div>
                    {aboutImageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setAboutImageUrl("");
                          toast.message("Image retirée — enregistrez pour appliquer");
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

        <div className="mt-6 rounded-xl border border-ocean-100 bg-ocean-50/40 p-4">
          <p className="text-sm text-slate-700">
            Le <strong>mot du directeur</strong> (citation, photo, nom) se gère sur une page dédiée.
          </p>
          <Button asChild variant="outline" className="mt-3 border-ocean-200">
            <Link href="/admin/director">
              <UserCircle className="h-4 w-4" />
              Gérer le mot du directeur
            </Link>
          </Button>
        </div>
      </AdminPanel>

      {canWrite && (
        <Button type="submit" variant="ocean" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer les paramètres"}
        </Button>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  className,
  dir,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  className?: string;
  dir?: "rtl";
}) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        disabled={false}
        className="mt-1.5 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
        dir={dir}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  className,
  dir,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue: string;
  className?: string;
  dir?: "rtl";
  rows?: number;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-1.5 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
        dir={dir}
      />
    </div>
  );
}
