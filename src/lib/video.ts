export type VideoSource =
  | { type: "youtube"; embedUrl: string; watchUrl: string }
  | { type: "file"; src: string }
  | null;

export function parseVideoSource(url: string | null | undefined): VideoSource {
  if (!url?.trim()) return null;
  const trimmed = url.trim();

  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
    };
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { type: "file", src: trimmed };
  }

  return null;
}

export function isVideoUrl(url: string | null | undefined): boolean {
  return parseVideoSource(url) !== null;
}
