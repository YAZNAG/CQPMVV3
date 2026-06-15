/** Category badge tones for news cards — maps slug keywords to mockup-style colors */
export function getNewsCategoryTone(slug?: string | null): {
  bg: string;
  text: string;
} {
  const key = (slug ?? "").toLowerCase();

  if (key.includes("formation") || key.includes("qualif")) {
    return { bg: "bg-emerald-100", text: "text-emerald-800" };
  }
  if (key.includes("evenement") || key.includes("event") || key.includes("activ")) {
    return { bg: "bg-sky-100", text: "text-sky-800" };
  }
  if (key.includes("recherche") || key.includes("research")) {
    return { bg: "bg-orange-100", text: "text-orange-800" };
  }
  if (key.includes("vie") || key.includes("etudiant") || key.includes("student")) {
    return { bg: "bg-blue-100", text: "text-blue-800" };
  }
  if (key.includes("annonce") || key.includes("communique") || key.includes("inscription")) {
    return { bg: "bg-rose-100", text: "text-rose-800" };
  }

  return { bg: "bg-slate-100", text: "text-slate-700" };
}

/** Estimate reading time from HTML content */
export function estimateReadMinutes(content: string, locale: "fr" | "ar" = "fr"): number {
  const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatReadTime(minutes: number, locale: "fr" | "ar"): string {
  if (locale === "ar") {
    return minutes === 1 ? "دقيقة واحدة للقراءة" : `${minutes} دقائق للقراءة`;
  }
  return minutes === 1 ? "1 min de lecture" : `${minutes} min de lecture`;
}

export function formatEventDateTime(date: Date | null, locale: "fr" | "ar"): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatCommuniqueDate(date: Date, locale: "fr" | "ar"): { day: string; monthYear: string } {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const monthYear = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    month: "short",
    year: "numeric",
  })
    .format(d)
    .toUpperCase();
  return { day, monthYear };
}

/** Tag tone for communiqué info labels */
export function getCommuniqueTagTone(label?: string | null): { bg: string; text: string } {
  const key = (label ?? "").toLowerCase();

  if (key.includes("inscription")) {
    return { bg: "bg-sky-100", text: "text-sky-800" };
  }
  if (key.includes("examen") || key.includes("concours")) {
    return { bg: "bg-amber-100", text: "text-amber-800" };
  }
  if (key.includes("note") || key.includes("service")) {
    return { bg: "bg-rose-100", text: "text-rose-800" };
  }

  return { bg: "bg-slate-100", text: "text-slate-700" };
}
