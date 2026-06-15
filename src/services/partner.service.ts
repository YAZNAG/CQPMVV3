import { prisma } from "@/lib/db";

export type PartnerRecord = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  order: number;
  isPublished: boolean;
};

export async function getPublishedPartners(): Promise<PartnerRecord[]> {
  return prisma.partner.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

export async function listAdminPartners(): Promise<PartnerRecord[]> {
  return prisma.partner.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}
