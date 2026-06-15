"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { runAdminAction } from "@/lib/api/action-handler";
import type { PermissionResource } from "@/lib/auth/rbac";
import type { ActionResult } from "@/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const ALLOWED_VIDEO_EXT = new Set(["mp4", "webm", "mov"]);

const FOLDER_RESOURCE: Record<string, PermissionResource> = {
  formations: "formations",
  gallery: "gallery",
  news: "news",
  events: "hero",
  partners: "formations",
  applications: "admissions",
  engagement: "hero",
  hero: "hero",
  about: "settings",
  director: "settings",
  highlights: "hero",
  pages: "pages",
  site: "settings",
};

function resolveUploadFolder(raw: string | null | undefined) {
  const folder = raw?.trim() || "formations";
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "formations";
  const resource = FOLDER_RESOURCE[safeFolder] ?? "formations";
  return { safeFolder, resource };
}

export async function uploadAdminImage(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const { safeFolder, resource } = resolveUploadFolder(
    formData.get("folder")?.toString()
  );

  return runAdminAction({
    name: "uploadAdminImage",
    resource,
    permission: "write",
    input: formData,
    handler: async (_ctx, raw) => {
      const fd = raw as FormData;
      const file = fd.get("file");

      if (!(file instanceof File) || file.size === 0) {
        return { success: false, error: "Choisissez une image à téléverser." };
      }

      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return {
          success: false,
          error: "Format non supporté. Utilisez JPG, PNG, WebP ou GIF.",
        };
      }

      if (file.size > MAX_IMAGE_BYTES) {
        return { success: false, error: "Image trop lourde (max 8 Mo)." };
      }

      const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const ext = ALLOWED_IMAGE_EXT.has(rawExt) ? rawExt : "jpg";
      const filename = `${randomUUID()}.${ext === "jpeg" ? "jpg" : ext}`;

      const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
      await mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);

      return {
        success: true,
        data: { url: `/uploads/${safeFolder}/${filename}` },
      };
    },
  });
}

export async function uploadAdminVideo(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const { safeFolder, resource } = resolveUploadFolder(
    formData.get("folder")?.toString()
  );

  return runAdminAction({
    name: "uploadAdminVideo",
    resource,
    permission: "write",
    input: formData,
    handler: async (_ctx, raw) => {
      const fd = raw as FormData;
      const file = fd.get("file");

      if (!(file instanceof File) || file.size === 0) {
        return { success: false, error: "Choisissez une vidéo à téléverser." };
      }

      if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
        return {
          success: false,
          error: "Format non supporté. Utilisez MP4, WebM ou MOV.",
        };
      }

      if (file.size > MAX_VIDEO_BYTES) {
        return { success: false, error: "Vidéo trop lourde (max 50 Mo)." };
      }

      const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
      const ext = ALLOWED_VIDEO_EXT.has(rawExt) ? rawExt : "mp4";
      const filename = `${randomUUID()}.${ext}`;

      const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
      await mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);

      return {
        success: true,
        data: { url: `/uploads/${safeFolder}/${filename}` },
      };
    },
  });
}
