import { prisma } from "@/lib/db";
import type { AdmissionFieldType } from "@/lib/validations/admission-form";
import type { Prisma } from "@prisma/client";

export type AdmissionFormFieldRecord = {
  id: string;
  key: string;
  type: AdmissionFieldType;
  labelFr: string;
  labelAr: string;
  placeholderFr: string | null;
  placeholderAr: string | null;
  helpTextFr: string | null;
  helpTextAr: string | null;
  options: { value: string; labelFr: string; labelAr: string }[] | null;
  defaultValue: string | null;
  isRequired: boolean;
  width: string;
  order: number;
  isPublished: boolean;
  buttonStyle: string | null;
};

export type FormationDocumentRequirementRecord = {
  id: string;
  formationId: string;
  documentKey: string;
  labelFr: string;
  labelAr: string;
  hintFr: string | null;
  hintAr: string | null;
  acceptTypes: string;
  maxSizeMb: number;
  order: number;
  isRequired: boolean;
};

function mapAdmissionField(row: {
  id: string;
  key: string;
  type: string;
  labelFr: string;
  labelAr: string;
  placeholderFr: string | null;
  placeholderAr: string | null;
  helpTextFr: string | null;
  helpTextAr: string | null;
  options: Prisma.JsonValue;
  defaultValue: string | null;
  isRequired: boolean;
  width: string;
  order: number;
  isPublished: boolean;
  buttonStyle: string | null;
}): AdmissionFormFieldRecord {
  return {
    ...row,
    type: row.type as AdmissionFieldType,
    options: Array.isArray(row.options)
      ? (row.options as AdmissionFormFieldRecord["options"])
      : null,
  };
}

export async function listAdminAdmissionFormFields(): Promise<AdmissionFormFieldRecord[]> {
  const rows = await prisma.admissionFormField.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
  return rows.map(mapAdmissionField);
}

export async function getPublishedAdmissionFormFields(): Promise<AdmissionFormFieldRecord[]> {
  const rows = await prisma.admissionFormField.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
  return rows.map(mapAdmissionField);
}

export async function listFormationDocumentRequirements(
  formationId: string
): Promise<FormationDocumentRequirementRecord[]> {
  return prisma.formationDocumentRequirement.findMany({
    where: { formationId, deletedAt: null },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
}

export async function listAllFormationDocumentRequirements(): Promise<
  (FormationDocumentRequirementRecord & {
    formation: { id: string; titleFr: string };
  })[]
> {
  const rows = await prisma.formationDocumentRequirement.findMany({
    where: { deletedAt: null },
    include: { formation: { select: { id: true, titleFr: true } } },
    orderBy: [{ formation: { titleFr: "asc" } }, { order: "asc" }],
  });
  return rows;
}

export async function getFormationDocumentsMap(): Promise<
  Record<string, FormationDocumentRequirementRecord[]>
> {
  const rows = await prisma.formationDocumentRequirement.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }],
  });
  const map: Record<string, FormationDocumentRequirementRecord[]> = {};
  for (const row of rows) {
    if (!map[row.formationId]) map[row.formationId] = [];
    map[row.formationId].push(row);
  }
  return map;
}

export async function ensureUniqueAdmissionFieldKey(key: string, excludeId?: string) {
  const existing = await prisma.admissionFormField.findFirst({
    where: {
      key,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
  if (existing) throw new Error("Cette clé de champ existe déjà");
}

export async function ensureUniqueFormationDocumentKey(
  formationId: string,
  documentKey: string,
  excludeId?: string
) {
  const existing = await prisma.formationDocumentRequirement.findFirst({
    where: {
      formationId,
      documentKey,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
  if (existing) throw new Error("Cette pièce jointe existe déjà pour cette formation");
}

export const DEFAULT_ADMISSION_FORM_FIELDS: Omit<AdmissionFormFieldRecord, "id">[] = [
  { key: "lastName", type: "TEXT", labelFr: "Nom", labelAr: "الاسم العائلي", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "half", order: 0, isPublished: true, buttonStyle: null },
  { key: "firstName", type: "TEXT", labelFr: "Prénom", labelAr: "الاسم الشخصي", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "half", order: 1, isPublished: true, buttonStyle: null },
  { key: "cin", type: "TEXT", labelFr: "Numéro CIN", labelAr: "رقم البطاقة الوطنية", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "half", order: 2, isPublished: true, buttonStyle: null },
  { key: "birthDate", type: "DATE", labelFr: "Date de naissance", labelAr: "تاريخ الازدياد", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "half", order: 3, isPublished: true, buttonStyle: null },
  { key: "gender", type: "GENDER_SELECT", labelFr: "Sexe", labelAr: "الجنس", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: "M", isRequired: true, width: "half", order: 4, isPublished: true, buttonStyle: null },
  { key: "formationId", type: "FORMATION_SELECT", labelFr: "Formation choisie", labelAr: "التكوين المختار", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "half", order: 5, isPublished: true, buttonStyle: null },
  { key: "address", type: "TEXT", labelFr: "Adresse", labelAr: "العنوان", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "full", order: 6, isPublished: true, buttonStyle: null },
  { key: "city", type: "TEXT", labelFr: "Ville", labelAr: "المدينة", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "half", order: 7, isPublished: true, buttonStyle: null },
  { key: "phone", type: "TEL", labelFr: "Téléphone", labelAr: "الهاتف", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "half", order: 8, isPublished: true, buttonStyle: null },
  { key: "email", type: "EMAIL", labelFr: "Email", labelAr: "البريد الإلكتروني", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "half", order: 9, isPublished: true, buttonStyle: null },
  { key: "educationLevel", type: "TEXT", labelFr: "Niveau scolaire", labelAr: "المستوى الدراسي", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: true, width: "half", order: 10, isPublished: true, buttonStyle: null },
  { key: "documents_heading", type: "HEADING", labelFr: "Pièces jointes", labelAr: "المرفقات", placeholderFr: null, placeholderAr: null, helpTextFr: "Les documents requis dépendent de la formation choisie.", helpTextAr: "المرفقات المطلوبة تعتمد على التكوين المختار.", options: null, defaultValue: null, isRequired: false, width: "full", order: 11, isPublished: true, buttonStyle: null },
  { key: "submit", type: "SUBMIT_BUTTON", labelFr: "Soumettre la candidature", labelAr: "إرسال الطلب", placeholderFr: null, placeholderAr: null, helpTextFr: null, helpTextAr: null, options: null, defaultValue: null, isRequired: false, width: "full", order: 12, isPublished: true, buttonStyle: "ocean" },
];

export const DEFAULT_FORMATION_DOCUMENTS = [
  { documentKey: "cin", labelFr: "CIN (PDF)", labelAr: "البطاقة الوطنية (PDF)", hintFr: "PDF, max. 8 Mo", hintAr: "PDF، 8 م.ب كحد أقصى", acceptTypes: "pdf", maxSizeMb: 8, order: 0 },
  { documentKey: "diploma", labelFr: "Diplôme / attestation", labelAr: "الشهادة / الإشهاد", hintFr: "PDF, max. 8 Mo", hintAr: "PDF، 8 م.ب كحد أقصى", acceptTypes: "pdf", maxSizeMb: 8, order: 1 },
  { documentKey: "photo", labelFr: "Photo d'identité", labelAr: "صورة شخصية", hintFr: "JPG ou PNG, max. 4 Mo", hintAr: "JPG أو PNG، 4 م.ب كحد أقصى", acceptTypes: "image", maxSizeMb: 4, order: 2 },
] as const;
