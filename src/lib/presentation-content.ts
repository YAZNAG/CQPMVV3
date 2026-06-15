import type { SiteSettings } from "@prisma/client";
import {
  aboutMissionsText,
  aboutPresentationParagraph1,
  aboutPresentationParagraph2,
} from "@/lib/about-default-content";
import {
  presentationLabels,
  presentationMissionTitles,
  presentationValueDescriptions,
  presentationWhyChoose,
} from "@/lib/presentation-defaults";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

export type PresentationMission = {
  title: string;
  description: string;
};

export type PresentationValue = {
  title: string;
  description: string;
};

export type PresentationWhyChoose = {
  title: string;
  description: string;
};

export type PresentationDomain = {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
};

export type PresentationGalleryPhoto = {
  id: string;
  imageUrl: string;
  alt: string;
};

export type PresentationPublicContent = {
  heroTitle: string;
  heroSubtitle: string;
  aboutLabel: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  missionsTitle: string;
  missions: PresentationMission[];
  valuesTitle: string;
  valuesSubtitle: string;
  values: PresentationValue[];
  whyChooseTitle: string;
  whyChoose: PresentationWhyChoose[];
  domainsTitle: string;
  lifeTitle: string;
  partnersLabel: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  readMoreLabel: string;
};

function splitLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[-•·]\s*/, "").trim())
    .filter(Boolean);
}

function splitParagraphs(text: string): string[] {
  const parts = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 0) return parts;
  return splitLines(text);
}

export function resolvePresentationPublicContent(
  settings: SiteSettings | null,
  locale: Locale
): Omit<
  PresentationPublicContent,
  "domainsTitle" | "lifeTitle" | "partnersLabel"
> & { domainsTitle: string; lifeTitle: string; partnersLabel: string } {
  const labels = presentationLabels(locale);
  const missionTitles = presentationMissionTitles(locale);
  const valueDescriptions = presentationValueDescriptions(locale);

  const history =
    getLocalized(locale, settings?.aboutHistoryFr ?? "", settings?.aboutHistoryAr ?? "") ||
    aboutPresentationParagraph1(locale);
  const presentation =
    getLocalized(locale, settings?.aboutPresentationFr ?? "", settings?.aboutPresentationAr ?? "") ||
    aboutPresentationParagraph2(locale);

  const aboutParagraphs = [history, presentation].filter(Boolean);

  const missionLines = splitLines(
    getLocalized(locale, settings?.missionFr ?? "", settings?.missionAr ?? "") ||
      aboutMissionsText(locale)
  );
  const missions: PresentationMission[] =
    missionLines.length > 0
      ? missionLines.map((line) => ({
          title: line,
          description: "",
        }))
      : missionTitles.map((title, index) => ({
          title,
          description:
            locale === "ar"
              ? "المساهمة في تأهيل مهنيي البحر وتعزيز السلامة والتنمية المستدامة."
              : "Contribuer à la qualification des professionnels de la mer et au développement durable du secteur.",
        }));

  const valueLines = splitLines(
    getLocalized(locale, settings?.valuesFr ?? "", settings?.valuesAr ?? "")
  );
  const defaultValueTitles =
    locale === "ar"
      ? ["التميز", "الانضباط", "الابتكار", "الاحترافية", "النزاهة", "الاحترام"]
      : ["Excellence", "Discipline", "Innovation", "Professionnalisme", "Intégrité", "Respect"];
  const valueTitles = valueLines.length > 0 ? valueLines : defaultValueTitles;
  const values: PresentationValue[] = valueTitles.map((title, index) => ({
    title,
    description: valueDescriptions[index] ?? title,
  }));

  return {
    heroTitle: labels.heroTitle,
    heroSubtitle:
      getLocalized(locale, settings?.taglineFr ?? "", settings?.taglineAr ?? "") ||
      labels.heroSubtitle,
    aboutLabel: labels.aboutLabel,
    aboutTitle: labels.aboutTitle,
    aboutParagraphs,
    missionsTitle: labels.missionsTitle,
    missions,
    valuesTitle: labels.valuesTitle,
    valuesSubtitle: labels.valuesSubtitle,
    values: values.slice(0, 6),
    whyChooseTitle: labels.whyChooseTitle,
    whyChoose: [...presentationWhyChoose(locale)],
    domainsTitle: labels.domainsTitle,
    lifeTitle: labels.lifeTitle,
    partnersLabel: labels.partnersLabel,
    ctaTitle: labels.ctaTitle,
    ctaSubtitle: labels.ctaSubtitle,
    ctaPrimaryLabel: labels.ctaPrimary,
    ctaSecondaryLabel: labels.ctaSecondary,
    readMoreLabel: labels.readMore,
  };
}
