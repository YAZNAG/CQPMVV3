import { z } from "zod";

export const inscriptionApplicationSchema = z.object({
  yearId: z.string().cuid(),
  levelId: z.string().cuid(),
  filiereId: z.string().cuid(),
  candidatProfile: z.enum(["COLLEGIEN", "PROFESSIONNEL", "APPRENTISSAGE"]),
  nom: z.string().min(2).max(100),
  prenom: z.string().min(2).max(100),
  cin: z.string().min(4).max(20),
  dateNaissance: z.string().refine((d) => !isNaN(Date.parse(d)), "Date invalide"),
  telephone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  adresse: z.string().min(5).max(500),
  ville: z.string().min(2).max(100),
  niveauScolaire: z.string().max(200).optional(),
  experienceMois: z.number().int().min(0).optional(),
});

export const inscriptionStatusUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["PENDING", "IN_REVIEW", "INCOMPLETE", "ACCEPTED", "REJECTED"]),
  note: z.string().max(2000).optional(),
  motifRefus: z.string().max(2000).optional(),
});

export const levelSchema = z.object({
  nameFr: z.string().min(1).max(200),
  nameAr: z.string().min(1).max(200),
  descriptionFr: z.string().max(2000).optional(),
  descriptionAr: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const filiereSchema = z.object({
  levelId: z.string().cuid(),
  nameFr: z.string().min(1).max(200),
  nameAr: z.string().min(1).max(200),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const conditionSchema = z.object({
  levelId: z.string().cuid(),
  filiereId: z.string().cuid().optional().or(z.literal("")),
  candidatProfile: z.enum(["COLLEGIEN", "PROFESSIONNEL", "APPRENTISSAGE"]).optional(),
  textFr: z.string().min(1).max(2000),
  textAr: z.string().min(1).max(2000),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const pieceSchema = z.object({
  levelId: z.string().cuid(),
  filiereId: z.string().cuid().optional().or(z.literal("")),
  candidatProfile: z.enum(["COLLEGIEN", "PROFESSIONNEL", "APPRENTISSAGE"]).optional(),
  nameFr: z.string().min(1).max(300),
  nameAr: z.string().min(1).max(300),
  isRequired: z.boolean().default(true),
  maxSizeMb: z.number().int().min(1).max(50).default(5),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const yearSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  openDate: z.string().optional(),
  closeDate: z.string().optional(),
  isOpen: z.boolean().default(false),
});
