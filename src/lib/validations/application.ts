import { z } from "zod";

export const applicationSchema = z.object({
  lastName: z.string().min(2, "Nom requis"),
  firstName: z.string().min(2, "Prénom requis"),
  cin: z.string().min(5, "CIN invalide").max(20),
  birthDate: z.coerce.date(),
  gender: z.enum(["M", "F", "Autre"]),
  address: z.string().min(5),
  city: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email(),
  educationLevel: z.string().min(2),
  formationId: z.string().cuid(),
  cinFileUrl: z.string().url(),
  diplomaFileUrl: z.string().url(),
  photoFileUrl: z.string().url(),
});

export const applicationStatusSchema = z.object({
  cin: z.string().min(5).max(20),
  locale: z.enum(["fr", "ar"]).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>;
