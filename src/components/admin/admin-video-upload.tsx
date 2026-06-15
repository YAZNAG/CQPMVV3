"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Video } from "lucide-react";
import { uploadAdminVideo } from "@/actions/admin/upload.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminVideoUploadProps {
  folder?: string;
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
  className?: string;
  label?: string;
}

export function AdminVideoUpload({
  folder = "gallery",
  onUploaded,
  onError,
  className,
  label = "Choisir une vidéo",
}: AdminVideoUploadProps) {
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
      const result = await uploadAdminVideo(fd);
      if (result.success && result.data?.url) {
        onUploaded(result.data.url);
      } else {
        onError?.(result.error ?? "Échec du téléversement");
        setFileName(null);
      }
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
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
            <Video className="h-4 w-4" />
            {label}
          </>
        )}
      </Button>
      <p className="text-center text-xs text-slate-500">
        MP4, WebM ou MOV — max 50 Mo
      </p>
      {fileName && !isPending && (
        <p className="truncate text-center text-xs text-emerald-700">{fileName}</p>
      )}
    </div>
  );
}
