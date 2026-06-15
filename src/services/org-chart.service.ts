import type {
  OrgChartNodeAccent,
  OrgChartNodeIcon,
  OrgChartNodeStyle,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { DEFAULT_ORG_CHART_PAGE } from "@/lib/org-chart-defaults";
import { getSiteSettings } from "@/services/site-settings.service";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

export type OrgChartNodeRecord = {
  id: string;
  titleFr: string;
  titleAr: string;
  parentId: string | null;
  style: OrgChartNodeStyle;
  accent: OrgChartNodeAccent;
  icon: OrgChartNodeIcon;
  order: number;
  isPublished: boolean;
};

export type PublicOrgChartNode = {
  id: string;
  title: string;
  style: OrgChartNodeStyle;
  accent: OrgChartNodeAccent;
  icon: OrgChartNodeIcon;
  children: PublicOrgChartNode[];
};

export type PublicOrgChartPage = {
  title: string;
  subtitle: string;
  backgroundUrl: string | null;
  isPublished: boolean;
  roots: PublicOrgChartNode[];
};

export type OrgChartPageSettings = {
  orgChartPageTitleFr: string;
  orgChartPageTitleAr: string;
  orgChartPageSubtitleFr: string;
  orgChartPageSubtitleAr: string;
  orgChartBackgroundUrl: string | null;
  orgChartPublished: boolean;
};

function mapRecord(row: OrgChartNodeRecord): OrgChartNodeRecord {
  return row;
}

function mapPublicNode(node: OrgChartNodeRecord, locale: Locale, children: PublicOrgChartNode[]): PublicOrgChartNode {
  return {
    id: node.id,
    title: getLocalized(locale, node.titleFr, node.titleAr),
    style: node.style,
    accent: node.accent,
    icon: node.icon,
    children,
  };
}

export function buildOrgChartTree(
  nodes: OrgChartNodeRecord[],
  locale: Locale
): PublicOrgChartNode[] {
  const byParent = new Map<string | null, OrgChartNodeRecord[]>();

  for (const node of nodes) {
    const key = node.parentId;
    const list = byParent.get(key) ?? [];
    list.push(node);
    byParent.set(key, list);
  }

  for (const list of byParent.values()) {
    list.sort((a, b) => a.order - b.order || a.titleFr.localeCompare(b.titleFr));
  }

  const build = (parentId: string | null): PublicOrgChartNode[] => {
    const children = byParent.get(parentId) ?? [];
    return children.map((node) =>
      mapPublicNode(node, locale, build(node.id))
    );
  };

  return build(null);
}

export async function listAdminOrgChartNodes(): Promise<OrgChartNodeRecord[]> {
  const rows = await prisma.orgChartNode.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { titleFr: "asc" }],
  });
  return rows.map(mapRecord);
}

export async function getOrgChartPageSettings(): Promise<OrgChartPageSettings> {
  const settings = await getSiteSettings();
  return {
    orgChartPageTitleFr: settings.orgChartPageTitleFr ?? DEFAULT_ORG_CHART_PAGE.orgChartPageTitleFr,
    orgChartPageTitleAr: settings.orgChartPageTitleAr ?? DEFAULT_ORG_CHART_PAGE.orgChartPageTitleAr,
    orgChartPageSubtitleFr:
      settings.orgChartPageSubtitleFr ?? DEFAULT_ORG_CHART_PAGE.orgChartPageSubtitleFr,
    orgChartPageSubtitleAr:
      settings.orgChartPageSubtitleAr ?? DEFAULT_ORG_CHART_PAGE.orgChartPageSubtitleAr,
    orgChartBackgroundUrl:
      settings.orgChartBackgroundUrl ?? DEFAULT_ORG_CHART_PAGE.orgChartBackgroundUrl,
    orgChartPublished: settings.orgChartPublished ?? true,
  };
}

export async function buildPublicOrgChartPage(locale: Locale): Promise<PublicOrgChartPage> {
  const [settings, nodes] = await Promise.all([
    getOrgChartPageSettings(),
    prisma.orgChartNode.findMany({
      where: { deletedAt: null, isPublished: true },
      orderBy: [{ order: "asc" }, { titleFr: "asc" }],
    }),
  ]);

  const isAr = locale === "ar";
  const isPublished = settings.orgChartPublished !== false;

  return {
    title: isAr ? settings.orgChartPageTitleAr : settings.orgChartPageTitleFr,
    subtitle: isAr ? settings.orgChartPageSubtitleAr : settings.orgChartPageSubtitleFr,
    backgroundUrl: settings.orgChartBackgroundUrl ?? DEFAULT_ORG_CHART_PAGE.orgChartBackgroundUrl,
    isPublished,
    roots: isPublished ? buildOrgChartTree(nodes.map(mapRecord), locale) : [],
  };
}

export function flattenOrgChartForSelect(nodes: OrgChartNodeRecord[], excludeId?: string) {
  const byParent = new Map<string | null, OrgChartNodeRecord[]>();
  for (const node of nodes) {
    if (node.id === excludeId) continue;
    const list = byParent.get(node.parentId) ?? [];
    list.push(node);
    byParent.set(node.parentId, list);
  }

  const result: { id: string | null; label: string; depth: number }[] = [
    { id: null, label: "— Racine (sommet) —", depth: 0 },
  ];

  const walk = (parentId: string | null, depth: number) => {
    const children = (byParent.get(parentId) ?? []).sort(
      (a, b) => a.order - b.order || a.titleFr.localeCompare(b.titleFr)
    );
    for (const child of children) {
      result.push({
        id: child.id,
        label: child.titleFr,
        depth,
      });
      walk(child.id, depth + 1);
    }
  };

  walk(null, 1);
  return result;
}
