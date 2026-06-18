import type { ReclamationStatus, ReclamationType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendEmail, buildReclamationAdminEmail, buildReclamationAckEmail } from "@/lib/email/mailer";

function generateReference(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `REC-${year}-${suffix}`;
}

async function uniqueReference(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const reference = generateReference();
    const existing = await prisma.reclamation.findFirst({
      where: { reference, deletedAt: null },
      select: { id: true },
    });
    if (!existing) return reference;
  }
  return `REC-${Date.now()}`;
}

export async function createReclamation(data: {
  name: string;
  cin: string;
  phone: string;
  email: string;
  type: ReclamationType;
  subject: string;
  description: string;
  attachmentUrl?: string | null;
}) {
  const reference = await uniqueReference();
  const rec = await prisma.reclamation.create({
    data: {
      reference: reference.toUpperCase(),
      ...data,
      attachmentUrl: data.attachmentUrl ?? null,
    },
  });

  const reclamationEmail = process.env.RECLAMATION_EMAIL ?? "reclamations@cqpm-nador.ma";
  const adminTpl = buildReclamationAdminEmail({
    reference: rec.reference,
    name: rec.name,
    email: rec.email,
    subject: rec.subject,
    description: rec.description,
    type: rec.type,
    reclamationId: rec.id,
  });
  sendEmail({ ...adminTpl, to: reclamationEmail, type: "RECLAMATION_ADMIN", reclamationId: rec.id }).catch(() => {});

  const ackTpl = buildReclamationAckEmail({ reference: rec.reference, name: rec.name, subject: rec.subject });
  sendEmail({ ...ackTpl, to: rec.email, type: "RECLAMATION_ACK", reclamationId: rec.id }).catch(() => {});

  return rec;
}

export async function trackReclamation(reference: string, email: string) {
  return prisma.reclamation.findFirst({
    where: {
      reference: reference.trim().toUpperCase(),
      email: { equals: email.trim(), mode: "insensitive" },
      deletedAt: null,
    },
    select: {
      reference: true,
      subject: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      responseNote: true,
    },
  });
}

export function reclamationStatusLabel(
  status: ReclamationStatus,
  locale: "fr" | "ar"
): string {
  const labels: Record<ReclamationStatus, { fr: string; ar: string }> = {
    PENDING: { fr: "En attente", ar: "قيد الانتظار" },
    IN_REVIEW: { fr: "En cours d'analyse", ar: "قيد المعالجة" },
    RESOLVED: { fr: "Traitée", ar: "تمت المعالجة" },
    CLOSED: { fr: "Clôturée", ar: "مغلقة" },
  };
  return locale === "ar" ? labels[status].ar : labels[status].fr;
}
