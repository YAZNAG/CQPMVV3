"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { updateGalleryPageHero } from "@/actions/admin/gallery-page.actions";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";
import type { GalleryPageHeroSettings } from "@/lib/gallery-page-defaults";

interface GalleryPageHeroSettingsProps {
  page: "photos" | "videos";
  initial: GalleryPageHeroSettings;
  canWrite: boolean;
}

export function GalleryPageHeroSettings({
  page,
  initial,
  canWrite,
}: GalleryPageHeroSettingsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    startTransition(async () => {
      const result = await updateGalleryPageHero({
        page,
        ...form,
      });
      if (result.success) {
        toast.success("En-tête de page enregistré");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  const pageLabel = page === "photos" ? "Photos" : "Vidéos";

  return (
    <AdminCard>
      <AdminCardHeader>
        <AdminCardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="h-5 w-5 text-ocean-600" />
          En-tête — page {pageLabel}
        </AdminCardTitle>
      </AdminCardHeader>
      <AdminCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${page}-titleFr`}>Titre (FR)</Label>
              <Input
                id={`${page}-titleFr`}
                value={form.titleFr}
                onChange={(e) => setForm((s) => ({ ...s, titleFr: e.target.value }))}
                disabled={!canWrite}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${page}-titleAr`}>Titre (AR)</Label>
              <Input
                id={`${page}-titleAr`}
                value={form.titleAr}
                onChange={(e) => setForm((s) => ({ ...s, titleAr: e.target.value }))}
                disabled={!canWrite}
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${page}-subtitleFr`}>Sous-titre (FR)</Label>
              <Textarea
                id={`${page}-subtitleFr`}
                value={form.subtitleFr}
                onChange={(e) => setForm((s) => ({ ...s, subtitleFr: e.target.value }))}
                disabled={!canWrite}
                rows={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${page}-subtitleAr`}>Sous-titre (AR)</Label>
              <Textarea
                id={`${page}-subtitleAr`}
                value={form.subtitleAr}
                onChange={(e) => setForm((s) => ({ ...s, subtitleAr: e.target.value }))}
                disabled={!canWrite}
                dir="rtl"
                rows={2}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image de fond</Label>
            {form.heroBackgroundUrl && (
              <div
                className="mb-3 h-32 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${form.heroBackgroundUrl})` }}
              />
            )}
            {canWrite ? (
              <AdminImageUpload
                folder="gallery"
                onUploaded={(url) =>
                  setForm((s) => ({ ...s, heroBackgroundUrl: url }))
                }
                onError={(message) => toast.error(message)}
              />
            ) : (
              <p className="text-sm text-slate-500">{form.heroBackgroundUrl ?? "—"}</p>
            )}
          </div>

          {canWrite && (
            <Button type="submit" variant="ocean" disabled={isPending}>
              Enregistrer l&apos;en-tête
            </Button>
          )}
        </form>
      </AdminCardContent>
    </AdminCard>
  );
}
