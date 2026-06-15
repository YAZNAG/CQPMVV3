/** Category icon tone for gallery video cards */
export function getGalleryCategoryTone(slug?: string): {
  bg: string;
  text: string;
  icon: "formation" | "workshop" | "infra" | "life" | "event" | "default";
} {
  const key = (slug ?? "").toLowerCase();

  if (key.includes("formation") || key.includes("qualif") || key.includes("peche") || key.includes("machine")) {
    return { bg: "bg-sky-100", text: "text-sky-700", icon: "formation" };
  }
  if (key.includes("atelier") || key.includes("workshop") || key.includes("pratique")) {
    return { bg: "bg-emerald-100", text: "text-emerald-700", icon: "workshop" };
  }
  if (key.includes("infra") || key.includes("centre") || key.includes("cqpm")) {
    return { bg: "bg-violet-100", text: "text-violet-700", icon: "infra" };
  }
  if (key.includes("vie") || key.includes("etudiant") || key.includes("student")) {
    return { bg: "bg-blue-100", text: "text-blue-700", icon: "life" };
  }
  if (key.includes("agenda") || key.includes("event") || key.includes("evenement")) {
    return { bg: "bg-orange-100", text: "text-orange-700", icon: "event" };
  }

  return { bg: "bg-slate-100", text: "text-slate-700", icon: "default" };
}
