import type { NavigationItemType, NavigationLocation } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getFormationNavChildren } from "@/lib/formation-default-content";
import { buildHeaderNavItems } from "@/lib/navigation/header-nav";
import { locales } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/types";

export type NavigationTreeItem = {
  id: string;
  labelFr: string;
  labelAr: string;
  href: string;
  location: NavigationLocation;
  itemType: NavigationItemType;
  order: number;
  isPublished: boolean;
  exactMatch: boolean;
  openInNewTab: boolean;
  parentId: string | null;
  children: NavigationTreeItem[];
};

export type PublicNavItem = {
  id: string;
  href: string;
  label: string;
  exact?: boolean;
  openInNewTab?: boolean;
  /** Parent label only — opens dropdown, does not navigate */
  dropdownOnly?: boolean;
  children?: PublicNavItem[];
};

const navSelect = {
  id: true,
  labelFr: true,
  labelAr: true,
  href: true,
  location: true,
  itemType: true,
  order: true,
  isPublished: true,
  exactMatch: true,
  openInNewTab: true,
  parentId: true,
} as const;

function buildNavigationTree(
  items: Array<Omit<NavigationTreeItem, "children">>
): NavigationTreeItem[] {
  const map = new Map<string, NavigationTreeItem>();
  const roots: NavigationTreeItem[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node);
    } else if (!item.parentId) {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: NavigationTreeItem[]) => {
    nodes.sort((a, b) => a.order - b.order || a.labelFr.localeCompare(b.labelFr));
    nodes.forEach((node) => sortNodes(node.children));
  };
  sortNodes(roots);

  return roots;
}

export function isAboutSectionHref(href: string): boolean {
  const raw = href.trim().replace(/\/$/, "") || "/";
  if (raw === "/about" || raw === "about") return true;
  if (raw === "/#about" || raw === "#about") return true;
  return locales.some((l) => raw === `/${l}/about`);
}

export function normalizeNavigationHref(href: string): string {
  const raw = href.trim() || "/";
  if (isAboutSectionHref(raw)) return "/#about";

  const decoded = decodeURIComponent(raw).trim().toLowerCase();
  const looksLikeAbout =
    decoded.includes("propos") ||
    decoded.includes("about") ||
    decoded.includes("من نحن");

  if (looksLikeAbout && !decoded.startsWith("/formations")) {
    return "/#about";
  }

  return raw;
}

export function resolveNavHref(locale: Locale, href: string): string {
  const raw = normalizeNavigationHref(href);

  if (isAboutSectionHref(raw)) {
    return `/${locale}#about`;
  }

  const path = raw;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("#")) return `/${locale}${path}`;

  const hashIndex = path.indexOf("#");
  if (hashIndex >= 0) {
    const base = path.slice(0, hashIndex) || "/";
    const hash = path.slice(hashIndex);
    if (base === "/") return `/${locale}${hash}`;
    const normalized = base.startsWith("/") ? base : `/${base}`;
    return `/${locale}${normalized}${hash}`;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

export function toPublicNavTree(
  items: NavigationTreeItem[],
  locale: Locale
): PublicNavItem[] {
  return items.map((item) => ({
    id: item.id,
    href: resolveNavHref(locale, item.href),
    label: locale === "ar" ? item.labelAr : item.labelFr,
    exact: item.exactMatch,
    openInNewTab: item.openInNewTab,
    children:
      item.children.length > 0
        ? toPublicNavTree(item.children, locale)
        : undefined,
  }));
}

function isFormationsNavRoot(item: PublicNavItem, locale: Locale): boolean {
  return (
    item.href === `/${locale}/formations` ||
    (item.href.endsWith("/formations") && !item.href.includes("/formations/"))
  );
}

/** Inject formation detail links when the CMS menu has no children yet. */
export async function enrichFormationNavItems(
  items: PublicNavItem[],
  locale: Locale
): Promise<PublicNavItem[]> {
  const needsChildren = items.some(
    (item) => isFormationsNavRoot(item, locale) && !item.children?.length
  );
  if (!needsChildren) return items;

  const publishedSlugs = new Set(
    (
      await prisma.formation.findMany({
        where: { isPublished: true, deletedAt: null },
        select: { slug: true },
      })
    ).map((formation) => formation.slug)
  );

  const children = getFormationNavChildren(locale).filter((child) => {
    const slug = child.href.split("/").pop()!;
    return publishedSlugs.has(slug);
  });

  if (children.length === 0) return items;

  return items.map((item) => {
    if (!isFormationsNavRoot(item, locale) || item.children?.length) return item;
    return { ...item, children };
  });
}

/** Canonical header menu (formations filtered by published slugs). */
export async function getHeaderNavItems(
  locale: Locale,
  dict: Dictionary
): Promise<PublicNavItem[]> {
  return enrichFormationNavItems(buildHeaderNavItems(locale, dict), locale);
}

export function toPublicNavButtons(
  items: Array<Omit<NavigationTreeItem, "children">>,
  locale: Locale
): PublicNavItem[] {
  return items
    .slice()
    .sort((a, b) => a.order - b.order || a.labelFr.localeCompare(b.labelFr))
    .map((item) => ({
      id: item.id,
      href: resolveNavHref(locale, item.href),
      label: locale === "ar" ? item.labelAr : item.labelFr,
      openInNewTab: item.openInNewTab,
    }));
}

export async function getPublishedNavigation(
  location: Extract<NavigationLocation, "HEADER" | "FOOTER">
): Promise<NavigationTreeItem[]> {
  const items = await prisma.navigationItem.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
      itemType: "LINK",
      OR: [{ location }, { location: "BOTH" }],
    },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
    select: navSelect,
  });

  return buildNavigationTree(items);
}

export async function getPublishedHeaderButtons(): Promise<
  Array<Omit<NavigationTreeItem, "children">>
> {
  return prisma.navigationItem.findMany({
    where: {
      deletedAt: null,
      isPublished: true,
      itemType: "BUTTON",
      location: "HEADER",
    },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
    select: navSelect,
  });
}

export async function listAdminNavigation(): Promise<{
  links: NavigationTreeItem[];
  buttons: Array<Omit<NavigationTreeItem, "children">>;
}> {
  const items = await prisma.navigationItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
    select: navSelect,
  });

  const linkItems = items.filter((item) => item.itemType === "LINK");
  const buttonItems = items.filter((item) => item.itemType === "BUTTON");

  return {
    links: buildNavigationTree(linkItems),
    buttons: buttonItems,
  };
}

export async function countNavigationItems(): Promise<number> {
  return prisma.navigationItem.count({ where: { deletedAt: null } });
}

/** True once navigation rows exist (even if later soft-deleted in admin). */
export async function hasNavigationBeenConfigured(): Promise<boolean> {
  return (await prisma.navigationItem.count()) > 0;
}
