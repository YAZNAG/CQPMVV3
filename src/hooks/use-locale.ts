"use client";

import { useParams } from "next/navigation";
import type { Locale } from "@/types";
import { isValidLocale } from "@/lib/i18n/config";

export function useLocale(): Locale {
  const params = useParams();
  const locale = params?.locale as string;
  return isValidLocale(locale) ? locale : "fr";
}
