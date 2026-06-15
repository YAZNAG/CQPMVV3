"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { RATE_LIMITS, runPublicAction } from "@/lib/api";
import type { ActionResult } from "@/types";

const PDF_TYPES = new Set(["application/pdf"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PDF_EXT = new Set(["pdf"]);
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

export async function uploadApplicationFile(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  return runPublicAction({
    name: "uploadApplicationFile",
    rateLimit: RATE_LIMITS.application,
    input: formData,
    handler: async (_ctx, raw) => {
      const fd = raw as FormData;
      const file = fd.get("file");
      const kind = fd.get("kind")?.toString() ?? "pdf";

      if (!(file instanceof File) || file.size === 0) {
        return { success: false, error: "Choisissez un fichier." };
      }

      const maxBytes =
        (Number(fd.get("maxSizeMb")) || (kind === "image" ? 4 : 8)) * 1024 * 1024;

      const allowedTypes =
        kind === "image"
          ? IMAGE_TYPES
          : kind === "pdf_image"
            ? new Set([...PDF_TYPES, ...IMAGE_TYPES])
            : PDF_TYPES;

      if (!allowedTypes.has(file.type)) {
        return {
          success: false,
          error:
            kind === "image"
              ? "Format non supporté. Utilisez JPG ou PNG."
              : "Format non supporté. Utilisez PDF.",
        };
      }

      if (file.size > maxBytes) {
        return {
          success: false,
          error: `Fichier trop lourd (max ${Math.round(maxBytes / 1024 / 1024)} Mo).`,
        };
      }

      const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const extSet =
        kind === "image" ? IMAGE_EXT : kind === "pdf_image" ? new Set([...PDF_EXT, ...IMAGE_EXT]) : PDF_EXT;
      const ext = extSet.has(rawExt) ? rawExt : kind === "image" ? "jpg" : "pdf";

      const filename = `${randomUUID()}.${ext === "jpeg" ? "jpg" : ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "applications");
      await mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);

      return { success: true, data: { url: `/uploads/applications/${filename}` } };
    },
  });
}
