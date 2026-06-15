"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ImageIcon, Plus, Trash2, Video } from "lucide-react";
import { AdminGalleryImagesUpload } from "@/components/admin/admin-gallery-images-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { cn } from "@/lib/utils";

export interface PendingGalleryPhoto {
  id: string;
  url: string;
  name: string;
  size: number;
}

export interface PendingGalleryVideo {
  id: string;
  url: string;
  titleFr?: string;
}

interface GalleryAlbumPendingMediaProps {
  photos: PendingGalleryPhoto[];
  videos: PendingGalleryVideo[];
  onPhotosChange: (photos: PendingGalleryPhoto[]) => void;
  onVideosChange: (videos: PendingGalleryVideo[]) => void;
  className?: string;
}

export function GalleryAlbumPendingMedia({
  photos,
  videos,
  onPhotosChange,
  onVideosChange,
  className,
}: GalleryAlbumPendingMediaProps) {
  const videoUrlId = useId();
  const videoTitleId = useId();
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const addPhotos = (files: { url: string; name: string; size: number }[]) => {
    onPhotosChange([
      ...photos,
      ...files.map((f) => ({
        id: crypto.randomUUID(),
        url: f.url,
        name: f.name,
        size: f.size,
      })),
    ]);
  };

  const removePhoto = (id: string) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const removeVideo = (id: string) => {
    onVideosChange(videos.filter((v) => v.id !== id));
  };

  const handleAddVideo = () => {
    const url = videoUrl.trim();
    if (!url) return;
    onVideosChange([
      ...videos,
      {
        id: crypto.randomUUID(),
        url,
        titleFr: videoTitle.trim() || undefined,
      },
    ]);
    setVideoUrl("");
    setVideoTitle("");
  };

  const total = photos.length + videos.length;

  return (
    <AdminPanel className={className}>
      <AdminPanelHeader
        icon={ImageIcon}
        title="Photos & vidéos"
        description="Téléversez des images ou ajoutez des liens vidéo. Ils seront enregistrés avec l'album."
        actions={
          total > 0 ? (
            <Badge variant="ocean">
              {photos.length} photo{photos.length !== 1 ? "s" : ""} · {videos.length} vidéo
              {videos.length !== 1 ? "s" : ""}
            </Badge>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean-100 text-ocean-700">
              <ImageIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800">Importer des photos</p>
              <p className="text-xs text-slate-500">JPG, PNG — max. 8 Mo · jusqu&apos;à 10 fichiers</p>
            </div>
          </div>
          <AdminGalleryImagesUpload
            maxFiles={10}
            onUploaded={(files) => addPhotos(files)}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
              <Video className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800">Ajouter une vidéo</p>
              <p className="text-xs text-slate-500">YouTube, Vimeo ou lien embed</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={videoUrlId} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                URL
              </Label>
              <Input
                id={videoUrlId}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="border-slate-200 bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={videoTitleId} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Titre (optionnel)
              </Label>
              <Input
                id={videoTitleId}
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Titre de la vidéo"
                className="border-slate-200 bg-slate-50/50"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-200"
              onClick={handleAddVideo}
              disabled={!videoUrl.trim()}
            >
              <Plus className="h-4 w-4" />
              Ajouter à la file
            </Button>
          </div>
        </div>
      </div>

      {total > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image src={photo.url} alt="" fill className="object-cover" />
                <Badge variant="ocean" className="absolute left-2 top-2">
                  Photo
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="truncate text-xs text-slate-600">{photo.name}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-red-600"
                  onClick={() => removePhoto(photo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
          {videos.map((video) => (
            <li
              key={video.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div
                className={cn(
                  "flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy-50 to-slate-100 px-4 text-slate-500"
                )}
              >
                <Video className="h-10 w-10 text-navy-400" />
                <span className="line-clamp-2 text-center text-xs">{video.url}</span>
                <Badge variant="navy">Vidéo</Badge>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="truncate text-xs text-slate-600">{video.titleFr ?? "Sans titre"}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-red-600"
                  onClick={() => removeVideo(video.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center text-sm text-slate-500">
          Aucun média pour l&apos;instant. Importez des photos ou ajoutez une vidéo ci-dessus.
        </p>
      )}
    </AdminPanel>
  );
}
