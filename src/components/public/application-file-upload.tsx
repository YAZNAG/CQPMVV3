"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, CloudUpload, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadApplicationFile } from "@/actions/upload.actions";
import { cn } from "@/lib/utils";

interface ApplicationFileUploadProps {
  label: string;
  hint?: string;
  acceptTypes: string;
  maxSizeMb: number;
  uploaded: boolean;
  onUploaded: (url: string) => void;
  required?: boolean;
  variant?: "default" | "portal";
  dragHint?: string;
  validatedLabel?: string;
  onRemove?: () => void;
}

export function ApplicationFileUpload({
  label,
  hint,
  acceptTypes,
  maxSizeMb,
  uploaded,
  onUploaded,
  required,
  variant = "default",
  dragHint = "Glissez ou cliquez ici",
  validatedLabel = "Validé",
  onRemove,
}: ApplicationFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);

  const accept =
    acceptTypes === "image"
      ? "image/jpeg,image/png,image/webp"
      : acceptTypes === "pdf_image"
        ? "application/pdf,image/jpeg,image/png"
        : "application/pdf";

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", acceptTypes);
    fd.append("maxSizeMb", String(maxSizeMb));

    startTransition(async () => {
      const result = await uploadApplicationFile(fd);
      if (result.success && result.data?.url) {
        onUploaded(result.data.url);
      } else {
        toast.error(result.error ?? "Échec du téléversement");
        setFileName(null);
      }
    });
  };

  if (variant === "portal") {
    return (
      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-5 transition-all",
          uploaded
            ? "border-sky-300 bg-sky-50/60"
            : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/20"
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-navy-900">
              {label}
              {required && <span className="text-red-500"> *</span>}
            </p>
            {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
          </div>
          {uploaded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              {validatedLabel}
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {uploaded ? (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2">
            <p className="truncate text-xs font-medium text-slate-700">
              {fileName ?? "Fichier téléversé"}
            </p>
            {onRemove && (
              <button
                type="button"
                onClick={() => {
                  setFileName(null);
                  onRemove();
                }}
                className="text-red-500 hover:text-red-600"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center transition-colors hover:border-sky-300 hover:bg-sky-50/30 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            ) : (
              <CloudUpload className="h-8 w-8 text-slate-400" />
            )}
            <span className="text-xs font-medium text-slate-500">{dragHint}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-dashed p-5 transition-all",
        uploaded
          ? "border-emerald-300 bg-emerald-50/60"
          : "border-slate-200 bg-slate-50/50 hover:border-ocean-300 hover:bg-ocean-50/30"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-navy-900">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </p>
          {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
        </div>
        {uploaded && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {!uploaded ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ocean-700 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Téléversement…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Choisir un fichier
            </>
          )}
        </button>
      ) : (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <Upload className="h-3.5 w-3.5" />
          {fileName ?? "Fichier téléversé"}
        </p>
      )}
    </div>
  );
}
