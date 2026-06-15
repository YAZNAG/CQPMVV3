import type { Locale } from "@/types";
import type { Dictionary } from "./dictionaries/fr";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("./dictionaries/fr").then((m) => m.fr),
  ar: () => import("./dictionaries/ar").then((m) => m.ar),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
