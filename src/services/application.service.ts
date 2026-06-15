import type { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Locale } from "@/types";
import { getLocalized } from "@/types";

const activeWhere = { deletedAt: null } as const;

export async function getApplicationStats() {
  const [total, pending, accepted, rejected, waitingList] = await Promise.all([
    prisma.application.count({ where: activeWhere }),
    prisma.application.count({ where: { ...activeWhere, status: "PENDING" } }),
    prisma.application.count({ where: { ...activeWhere, status: "ACCEPTED" } }),
    prisma.application.count({ where: { ...activeWhere, status: "REJECTED" } }),
    prisma.application.count({ where: { ...activeWhere, status: "WAITING_LIST" } }),
  ]);
  return { total, pending, accepted, rejected, waitingList };
}

export async function listApplications({
  status,
  search,
  page = 1,
  pageSize = 20,
}: {
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const where: Prisma.ApplicationWhereInput = {
    ...activeWhere,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { cin: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { referenceNumber: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        formation: { select: { titleFr: true, titleAr: true, slug: true } },
        reviewer: { select: { name: true, email: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getApplicationById(id: string) {
  return prisma.application.findFirst({
    where: { id, ...activeWhere },
    include: {
      formation: true,
      reviewer: { select: { id: true, name: true, email: true } },
      documents: {
        include: { mediaFile: true },
        orderBy: { type: "asc" },
      },
    },
  });
}

export async function getApplicationsByCin(cin: string, locale: Locale) {
  const applications = await prisma.application.findMany({
    where: { cin, ...activeWhere },
    orderBy: { createdAt: "desc" },
    include: { formation: true },
  });

  return applications.map((a) => ({
    id: a.id,
    status: a.status,
    referenceNumber: a.referenceNumber,
    updatedAt: a.updatedAt,
    createdAt: a.createdAt,
    formationTitle: getLocalized(
      locale,
      a.formation.titleFr,
      a.formation.titleAr
    ),
    statusNote: a.statusNote,
  }));
}
