/** Public CMS slugs for the « À propos » section */
export const ABOUT_PAGE_SLUGS = {
  presentation: "presentation",
  director: "mot-du-directeur",
  organigramme: "organigramme",
  chiffres: "nador-en-chiffres",
} as const;

export function isDirectorPageSlug(slug: string) {
  return slug === ABOUT_PAGE_SLUGS.director;
}

export function isPresentationPageSlug(slug: string) {
  return slug === ABOUT_PAGE_SLUGS.presentation;
}

export function isOrganigrammePageSlug(slug: string) {
  return slug === ABOUT_PAGE_SLUGS.organigramme;
}

export function isChiffresPageSlug(slug: string) {
  return slug === ABOUT_PAGE_SLUGS.chiffres;
}

export function aboutPageHref(slug: string) {
  return `/pages/${slug}`;
}
