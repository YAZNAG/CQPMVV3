import { prisma } from "@/lib/db";
import type { CandidatProfile, InscriptionStatus } from "@prisma/client";

export async function getOpenInscriptionYear() {
  return prisma.inscriptionYear.findFirst({
    where: { isOpen: true },
    orderBy: { year: "desc" },
  });
}

export async function getActiveLevels() {
  return prisma.inscriptionLevel.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { order: "asc" },
    include: {
      filieres: {
        where: { isActive: true, deletedAt: null },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getConditionsForSelection(
  levelId: string,
  filiereId: string,
  candidatProfile: CandidatProfile
) {
  return prisma.inscriptionCondition.findMany({
    where: {
      levelId,
      OR: [
        { filiereId: null, candidatProfile: null },
        { filiereId: null, candidatProfile },
        { filiereId, candidatProfile: null },
        { filiereId, candidatProfile },
      ],
      isActive: true,
      deletedAt: null,
    },
    orderBy: { order: "asc" },
  });
}

export async function getPiecesForSelection(
  levelId: string,
  filiereId: string,
  candidatProfile: CandidatProfile
) {
  return prisma.inscriptionPiece.findMany({
    where: {
      levelId,
      OR: [
        { filiereId: null, candidatProfile: null },
        { filiereId: null, candidatProfile },
        { filiereId, candidatProfile: null },
        { filiereId, candidatProfile },
      ],
      isActive: true,
      deletedAt: null,
    },
    orderBy: { order: "asc" },
  });
}

export async function generateReference(yearId: string): Promise<string> {
  const yearRecord = await prisma.inscriptionYear.findUnique({ where: { id: yearId } });
  const year = yearRecord?.year ?? new Date().getFullYear();
  const count = await prisma.inscriptionApplication.count({
    where: { yearId },
  });
  const seq = String(count + 1).padStart(6, "0");
  return `CQPM-${year}-${seq}`;
}

export async function getApplicationByReferenceAndCin(reference: string, cin: string) {
  return prisma.inscriptionApplication.findFirst({
    where: { reference: reference.toUpperCase(), cin: cin.toUpperCase(), deletedAt: null },
    include: {
      level: { select: { nameFr: true, nameAr: true } },
      filiere: { select: { nameFr: true, nameAr: true } },
      documents: {
        where: { deletedAt: null },
        include: { piece: { select: { nameFr: true, nameAr: true } } },
      },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
}
