/** Normalize common video URLs to embed-friendly iframes */
export function toEmbedVideoUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    // keep original
  }
  return url;
}

export function isGalleryFileVideo(url: string): boolean {
  return url.startsWith("/");
}

export function resolveGalleryVideoPlayback(url: string): {
  mode: "file" | "embed";
  src: string;
} {
  if (isGalleryFileVideo(url)) {
    return { mode: "file", src: url };
  }
  return { mode: "embed", src: toEmbedVideoUrl(url) };
}

/** Extract YouTube/Vimeo thumbnail when possible */
export function getVideoThumbnail(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  } catch {
    return null;
  }
  return null;
}
