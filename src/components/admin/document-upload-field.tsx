"use client";

import { CheckCircle2, Upload } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { cn } from "@/lib/utils";

type Endpoint = keyof OurFileRouter;

interface DocumentUploadFieldProps {
  label: string;
  hint?: string;
  endpoint: Endpoint;
  uploaded: boolean;
  onUploaded: (url: string) => void;
  required?: boolean;
}

export function DocumentUploadField({
  label,
  hint,
  endpoint,
  uploaded,
  onUploaded,
  required,
}: DocumentUploadFieldProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed p-4 transition-colors",
        uploaded ? "border-emerald-300 bg-emerald-50/50" : "border-navy-200 bg-navy-50/30"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-navy-900">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </p>
          {hint && <p className="mt-0.5 text-xs text-navy-500">{hint}</p>}
        </div>
        {uploaded && (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-label="Téléversé" />
        )}
      </div>
      {!uploaded ? (
        <UploadButton
          endpoint={endpoint}
          appearance={{
            button:
              "bg-ocean-600 text-white text-sm font-medium px-4 py-2 rounded-lg ut-ready:bg-ocean-600 ut-uploading:bg-ocean-400",
            allowedContent: "text-xs text-navy-500",
          }}
          onClientUploadComplete={(res) => {
            if (res?.[0]?.url) onUploaded(res[0].url);
          }}
          onUploadError={(error) => {
            console.error("Upload error:", error);
          }}
        />
      ) : (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <Upload className="h-3.5 w-3.5" />
          Fichier téléversé
        </p>
      )}
    </div>
  );
}
