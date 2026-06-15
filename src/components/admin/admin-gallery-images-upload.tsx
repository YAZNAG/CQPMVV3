"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadAdminImage } from "@/actions/admin/upload.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UploadedGalleryFile {
  url: string;
  name: string;
  size: number;
}

interface AdminGalleryImagesUploadProps {
  onUploaded: (files: UploadedGalleryFile[]) => void;
  maxFiles?: number;
  className?: string;
}

export function AdminGalleryImagesUpload({
  onUploaded,
  maxFiles = 10,
  className,
}: AdminGalleryImagesUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const files = Array.from(fileList).slice(0, maxFiles);

    startTransition(async () => {
      const uploaded: UploadedGalleryFile[] = [];

      for (let i = 0; i < files.length; i++) {
        setProgress(`${i + 1}/${files.length}`);
        const fd = new FormData();
        fd.append("file", files[i]);
        fd.append("folder", "gallery");

        const result = await uploadAdminImage(fd);
        if (result.success && result.data?.url) {
          uploaded.push({
            url: result.data.url,
            name: files[i].name,
            size: files[i].size,
          });
        } else {
          toast.error(result.error ?? "Échec du téléversement");
          if (uploaded.length > 0) onUploaded(uploaded);
          setProgress(null);
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
      }

      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
      if (uploaded.length > 0) {
        onUploaded(uploaded);
        toast.success(
          uploaded.length === 1
            ? "1 photo importée"
            : `${uploaded.length} photos importées`
        );
      }
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="ocean"
        className="w-full"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress ? `Import ${progress}…` : "Téléversement…"}
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" />
            Choisir des images
          </>
        )}
      </Button>
      <p className="text-center text-xs text-slate-500">
        JPG, PNG, WebP ou GIF — max 8 Mo · jusqu&apos;à {maxFiles} fichiers
      </p>
    </div>
  );
}
