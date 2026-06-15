import type { SiteSettings } from "@prisma/client";
import {
  defaultDirectorBody,
  defaultDirectorName,
  defaultDirectorQuote,
  defaultDirectorTitle,
  splitDirectorParagraphs,
} from "@/lib/director-defaults";
import { getLocalized } from "@/types";
import type { Locale } from "@/types";

export type DirectorPublicContent = {
  /** Citation courte — bandeau accueil */
  quote: string;
  /** Message complet — page Mot du Directeur */
  bodyParagraphs: string[];
  name: string;
  title: string;
  photoUrl: string | null;
  published: boolean;
};

export function resolveDirectorPublicContent(
  settings: Pick<
    SiteSettings,
    | "directorQuoteFr"
    | "directorQuoteAr"
    | "directorBodyFr"
    | "directorBodyAr"
    | "directorNameFr"
    | "directorNameAr"
    | "directorTitleFr"
    | "directorTitleAr"
    | "directorPhotoUrl"
    | "directorMessagePublished"
  >,
  locale: Locale
): DirectorPublicContent {
  const name = getLocalized(
    locale,
    settings.directorNameFr ?? "",
    settings.directorNameAr ?? ""
  );
  const title = getLocalized(
    locale,
    settings.directorTitleFr ?? "",
    settings.directorTitleAr ?? ""
  );

  const defaultName = defaultDirectorName(locale);
  const defaultTitle = defaultDirectorTitle(locale);

  const quoteExcerpt = getLocalized(
    locale,
    settings.directorQuoteFr ?? "",
    settings.directorQuoteAr ?? ""
  ).trim();

  const bodyRaw =
    getLocalized(locale, settings.directorBodyFr ?? "", settings.directorBodyAr ?? "").trim() ||
    quoteExcerpt ||
    defaultDirectorBody(locale);

  const bodyParagraphs = splitDirectorParagraphs(bodyRaw);
  const quote = quoteExcerpt
    ? splitDirectorParagraphs(quoteExcerpt)[0] ?? quoteExcerpt
    : bodyParagraphs[0] || defaultDirectorQuote(locale);

  return {
    quote,
    bodyParagraphs,
    name: name.trim() || defaultName,
    title: title.trim() || defaultTitle,
    photoUrl: settings.directorPhotoUrl,
    published: settings.directorMessagePublished !== false,
  };
}
