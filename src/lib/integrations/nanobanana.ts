/**
 * NanoBanana image API — optional CMS asset generation.
 * @see https://github.com/gemini-cli-extensions/nanobanana
 */

const API_BASE = process.env.NANOBANANA_API_URL ?? "https://api.nanobanana.dev/v1";

export function isNanobananaConfigured() {
  return Boolean(process.env.NANOBANANA_API_KEY);
}

export type NanobananaRequest = {
  prompt: string;
  style?: "maritime" | "professional";
  aspectRatio?: "16:9" | "4:3" | "1:1";
};

export async function generateMaritimeImage(req: NanobananaRequest) {
  const key = process.env.NANOBANANA_API_KEY;
  if (!key) return null;

  const res = await fetch(`${API_BASE}/images/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: req.prompt,
      style: req.style ?? "maritime",
      aspect_ratio: req.aspectRatio ?? "16:9",
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { url: string; id: string };
  return { imageUrl: data.url, requestId: data.id };
}
