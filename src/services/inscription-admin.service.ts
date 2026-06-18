import { prisma } from "@/lib/db";
import type { InscriptionStatus } from "@prisma/client";

export type InscriptionListFilters = {
  search?: string;
  levelId?: string;
  filiereId?: string;
  status?: InscriptionStatus;
  yearId?: string;
  page?: number;
  pageSize?: number;
};

export async function listInscriptionApplications(filters: InscriptionListFilters = {}) {
  const { search, levelId, filiereId, status, yearId, page = 1, pageSize = 20 } = filters;
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.inscriptionApplication.findMany>[0]["where"] = {
    deletedAt: null,
    ...(status && { status }),
    ...(levelId && { levelId }),
    ...(filiereId && { filiereId }),
    ...(yearId && { yearId }),
    ...(search && {
      OR: [
        { reference: { contains: search, mode: "insensitive" } },
        { cin: { contains: search, mode: "insensitive" } },
        { nom: { contains: search, mode: "insensitive" } },
        { prenom: { contains: search, mode: "insensitive" } },
        { telephone: { contains: search } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.inscriptionApplication.count({ where }),
    prisma.inscriptionApplication.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { submittedAt: "desc" },
      include: {
        level: { select: { nameFr: true } },
        filiere: { select: { nameFr: true } },
        year: { select: { year: true } },
        _count: { select: { documents: { where: { deletedAt: null } } } },
      },
    }),
  ]);

  return { total, items, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getInscriptionApplicationById(id: string) {
  return prisma.inscriptionApplication.findFirst({
    where: { id, deletedAt: null },
    include: {
      level: true,
      filiere: true,
      year: true,
      documents: {
        where: { deletedAt: null },
        include: { piece: true },
      },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getInscriptionStats() {
  const [total, pending, inReview, incomplete, accepted, rejected] = await Promise.all([
    prisma.inscriptionApplication.count({ where: { deletedAt: null } }),
    prisma.inscriptionApplication.count({ where: { deletedAt: null, status: "PENDING" } }),
    prisma.inscriptionApplication.count({ where: { deletedAt: null, status: "IN_REVIEW" } }),
    prisma.inscriptionApplication.count({ where: { deletedAt: null, status: "INCOMPLETE" } }),
    prisma.inscriptionApplication.count({ where: { deletedAt: null, status: "ACCEPTED" } }),
    prisma.inscriptionApplication.count({ where: { deletedAt: null, status: "REJECTED" } }),
  ]);
  return { total, pending, inReview, incomplete, accepted, rejected };
}

export async function listAdminLevels() {
  return prisma.inscriptionLevel.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
    include: { _count: { select: { filieres: true, applications: true } } },
  });
}

export async function listAdminFilieres(levelId?: string) {
  return prisma.inscriptionFiliere.findMany({
    where: { deletedAt: null, ...(levelId && { levelId }) },
    orderBy: { order: "asc" },
    include: {
      level: { select: { nameFr: true } },
      _count: { select: { applications: true } },
    },
  });
}

export async function listAdminConditions(levelId?: string) {
  return prisma.inscriptionCondition.findMany({
    where: { deletedAt: null, ...(levelId && { levelId }) },
    orderBy: [{ levelId: "asc" }, { order: "asc" }],
    include: {
      level: { select: { nameFr: true } },
      filiere: { select: { nameFr: true } },
    },
  });
}

export async function listAdminPieces(levelId?: string) {
  return prisma.inscriptionPiece.findMany({
    where: { deletedAt: null, ...(levelId && { levelId }) },
    orderBy: [{ levelId: "asc" }, { order: "asc" }],
    include: {
      level: { select: { nameFr: true } },
      filiere: { select: { nameFr: true } },
    },
  });
}

export async function listAdminYears() {
  return prisma.inscriptionYear.findMany({
    orderBy: { year: "desc" },
    include: { _count: { select: { applications: true } } },
  });
}
