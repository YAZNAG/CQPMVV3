const HEADER_OFFSET_PX = 88;

export { HEADER_OFFSET_PX };

export function parseHashHref(href: string): { path: string; hash: string | null } {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return { path: href, hash: null };
  return {
    path: href.slice(0, hashIndex) || "/",
    hash: href.slice(hashIndex + 1) || null,
  };
}

/** e.g. /fr/formations on page /fr → "formations" (home section anchor) */
export function sectionIdFromPageLink(href: string, pathname: string): string | null {
  const { path, hash } = parseHashHref(href);
  if (hash || path === pathname) return null;
  if (!path.startsWith(`${pathname}/`)) return null;
  return path.slice(pathname.length + 1).split("/")[0]?.split("#")[0] ?? null;
}

export function scrollToHash(hash: string, behavior: ScrollBehavior = "smooth"): boolean {
  const el = document.getElementById(hash);
  if (!el) return false;

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

/** Same-page anchor: scroll without full navigation. Returns true if handled. */
export function handleSamePageHashNav(
  href: string,
  pathname: string,
  onHandled?: () => void
): boolean {
  const { path, hash } = parseHashHref(href);
  if (!hash) return false;
  if (pathname !== path) return false;

  scrollToHash(hash);
  window.history.replaceState(null, "", href);
  window.dispatchEvent(new Event("hashchange"));
  onHandled?.();
  return true;
}
