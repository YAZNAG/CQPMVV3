import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  buildDynamicAdmissionSchema,
  documentKeyToLegacyType,
  extractApplicationSummary,
  validateFormationDocuments,
  type AdmissionFormFieldConfig,
} from "@/lib/admission-form-validation";
import {
  getPublishedAdmissionFormFields,
  listFormationDocumentRequirements,
} from "@/services/admission-form.service";
import {
  notifyAdminNewApplication,
  notifyApplicationReceived,
} from "@/lib/email/send";
import type { ActionResult } from "@/types";

export async function submitDynamicApplicationHandler(
  raw: unknown
): Promise<ActionResult<{ referenceNumber: string }>> {
  const fields = await getPublishedAdmissionFormFields();
  const inputFields: AdmissionFormFieldConfig[] = fields.map((f) => ({
    key: f.key,
    type: f.type,
    labelFr: f.labelFr,
    isRequired: f.isRequired,
    options: f.options,
  }));

  const schema = buildDynamicAdmissionSchema(inputFields);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, error: issue?.message ?? "Données invalides" };
  }

  const { formationId, formData, documents } = parsed.data;
  const mergedFormData = { ...formData, formationId };

  const summary = extractApplicationSummary(inputFields, mergedFormData, formationId);

  const existing = await prisma.application.findFirst({
    where: { cin: summary.cin, formationId, deletedAt: null },
  });
  if (existing) {
    return {
      success: false,
      error: "Une candidature existe déjà pour ce CIN et cette formation.",
    };
  }

  const formation = await prisma.formation.findFirst({
    where: { id: formationId, isPublished: true, deletedAt: null },
  });
  if (!formation) {
    return { success: false, error: "Formation invalide." };
  }

  const requirements = await listFormationDocumentRequirements(formationId);
  const docError = validateFormationDocuments(requirements, documents);
  if (docError) {
    return { success: false, error: docError };
  }

  const reqByKey = Object.fromEntries(requirements.map((r) => [r.documentKey, r]));

  const documentCreates = await Promise.all(
    documents.map(async (doc) => {
      const req = reqByKey[doc.documentKey];
      const isPdf = doc.fileUrl.toLowerCase().endsWith(".pdf");
      const media = await prisma.mediaFile.create({
        data: {
          url: doc.fileUrl,
          name: req?.labelFr ?? doc.documentKey,
          mimeType: isPdf ? "application/pdf" : "image/jpeg",
          size: 0,
          purpose: "APPLICATION_DOCUMENT",
        },
      });
      return {
        type: documentKeyToLegacyType(doc.documentKey),
        documentKey: doc.documentKey,
        labelFr: req?.labelFr ?? doc.documentKey,
        labelAr: req?.labelAr ?? doc.documentKey,
        mediaFileId: media.id,
      };
    })
  );

  const application = await prisma.application.create({
    data: {
      ...summary,
      formData: mergedFormData,
      documents: { create: documentCreates },
    },
  });

  const formationTitle = formation.titleFr;

  await Promise.all([
    notifyApplicationReceived({
      email: summary.email,
      firstName: summary.firstName,
      referenceNumber: application.referenceNumber,
      formationTitle,
    }),
    notifyAdminNewApplication({
      applicationId: application.id,
      referenceNumber: application.referenceNumber,
      applicantName: `${summary.firstName} ${summary.lastName}`,
      cin: summary.cin,
      formationTitle,
    }),
  ]).catch(() => undefined);

  revalidatePath("/admin/admissions");
  return { success: true, data: { referenceNumber: application.referenceNumber } };
}

/** Legacy fixed schema wrapper */
export async function submitApplicationHandler(data: {
  lastName: string;
  firstName: string;
  cin: string;
  birthDate: Date;
  gender: "M" | "F" | "Autre";
  address: string;
  city: string;
  phone: string;
  email: string;
  educationLevel: string;
  formationId: string;
  cinFileUrl: string;
  diplomaFileUrl: string;
  photoFileUrl: string;
}): Promise<ActionResult<{ referenceNumber: string }>> {
  return submitDynamicApplicationHandler({
    formationId: data.formationId,
    formData: {
      lastName: data.lastName,
      firstName: data.firstName,
      cin: data.cin,
      birthDate: data.birthDate.toISOString().slice(0, 10),
      gender: data.gender,
      address: data.address,
      city: data.city,
      phone: data.phone,
      email: data.email,
      educationLevel: data.educationLevel,
      formationId: data.formationId,
    },
    documents: [
      { documentKey: "cin", fileUrl: data.cinFileUrl },
      { documentKey: "diploma", fileUrl: data.diplomaFileUrl },
      { documentKey: "photo", fileUrl: data.photoFileUrl },
    ],
  });
}
