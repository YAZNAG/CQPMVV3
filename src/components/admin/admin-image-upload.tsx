"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadAdminImage } from "@/actions/admin/upload.actions";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStorageConfig } from "@/components/admin/storage-config-provider";

interface AdminImageUploadProps {
  folder?: string;
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
  className?: string;
}

export function AdminImageUpload({
  folder = "formations",
  onUploaded,
  onError,
  className,
}: AdminImageUploadProps) {
  const { cloudEnabled } = useStorageConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);

  const handleLocalUpload = (file: File | undefined) => {
    if (!file) return;

    setFileName(file.name);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    startTransition(async () => {
      const result = await uploadAdminImage(fd);
      if (result.success && result.data?.url) {
        onUploaded(result.data.url);
      } else {
        onError?.(result.error ?? "Échec du téléversement");
        setFileName(null);
      }
    });
  };

  if (cloudEnabled) {
    return (
      <div className={cn("space-y-2", className)}>
        <UploadButton
          endpoint="adminMedia"
          appearance={{
            button:
              "w-full bg-ocean-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg ut-ready:bg-ocean-600 ut-uploading:bg-ocean-400 flex items-center justify-center gap-2",
            allowedContent: "text-xs text-slate-500 text-center",
          }}
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.url;
            if (url) {
              setFileName(res[0]?.name ?? "Image");
              onUploaded(url);
            } else {
              onError?.("Échec du téléversement");
            }
          }}
          onUploadError={(error) => {
            onError?.(error.message ?? "Échec du téléversement");
            setFileName(null);
          }}
        />
        <p className="text-center text-xs text-slate-500">
          Stockage cloud (UploadThing) — JPG, PNG, WebP — max 8 Mo
        </p>
        <p className="text-center text-xs text-amber-700">
          Cliquez « Enregistrer » après le téléversement pour appliquer.
        </p>
        {fileName && (
          <p className="truncate text-center text-xs text-emerald-700">{fileName}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => handleLocalUpload(e.target.files?.[0])}
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
            Téléversement…
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" />
            Choisir une image
          </>
        )}
      </Button>
      <p className="text-center text-xs text-slate-500">
        Stockage local (/uploads/) — JPG, PNG, WebP ou GIF — max 8 Mo
      </p>
      <p className="text-center text-xs text-amber-700">
        Cliquez « Enregistrer » après le téléversement pour appliquer.
      </p>
      {fileName && !isPending && (
        <p className="truncate text-center text-xs text-emerald-700">{fileName}</p>
      )}
    </div>
  );
}
