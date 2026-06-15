import { prisma } from "@/lib/db";
import type { ContactFieldType } from "@/lib/validations/contact-form";
import type { Prisma } from "@prisma/client";

export type ContactFormFieldRecord = {
  id: string;
  key: string;
  type: ContactFieldType;
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

function mapField(row: {
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
}): ContactFormFieldRecord {
  return {
    ...row,
    type: row.type as ContactFieldType,
    options: Array.isArray(row.options)
      ? (row.options as ContactFormFieldRecord["options"])
      : null,
  };
}

export async function listAdminContactFormFields(): Promise<ContactFormFieldRecord[]> {
  const rows = await prisma.contactFormField.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
  return rows.map(mapField);
}

export async function getPublishedContactFormFields(): Promise<ContactFormFieldRecord[]> {
  const rows = await prisma.contactFormField.findMany({
    where: { deletedAt: null, isPublished: true },
    orderBy: [{ order: "asc" }, { labelFr: "asc" }],
  });
  return rows.map(mapField);
}

export async function hasContactFormBeenConfigured(): Promise<boolean> {
  const count = await prisma.contactFormField.count({ where: { deletedAt: null } });
  return count > 0;
}

export async function ensureUniqueContactFieldKey(key: string, excludeId?: string) {
  const existing = await prisma.contactFormField.findFirst({
    where: {
      key,
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
  if (existing) throw new Error("Cette clé de champ existe déjà");
}

export const DEFAULT_CONTACT_FORM_FIELDS: Omit<
  ContactFormFieldRecord,
  "id"
>[] = [
  {
    key: "name",
    type: "TEXT",
    labelFr: "Nom complet",
    labelAr: "الاسم الكامل",
    placeholderFr: "Votre nom",
    placeholderAr: "اسمك",
    helpTextFr: null,
    helpTextAr: null,
    options: null,
    defaultValue: null,
    isRequired: true,
    width: "half",
    order: 0,
    isPublished: true,
    buttonStyle: null,
  },
  {
    key: "email",
    type: "EMAIL",
    labelFr: "Email",
    labelAr: "البريد الإلكتروني",
    placeholderFr: "vous@exemple.com",
    placeholderAr: "you@example.com",
    helpTextFr: null,
    helpTextAr: null,
    options: null,
    defaultValue: null,
    isRequired: true,
    width: "half",
    order: 1,
    isPublished: true,
    buttonStyle: null,
  },
  {
    key: "phone",
    type: "TEL",
    labelFr: "Téléphone",
    labelAr: "الهاتف",
    placeholderFr: "+212 6…",
    placeholderAr: "+212 6…",
    helpTextFr: null,
    helpTextAr: null,
    options: null,
    defaultValue: null,
    isRequired: false,
    width: "full",
    order: 2,
    isPublished: true,
    buttonStyle: null,
  },
  {
    key: "subject",
    type: "SELECT",
    labelFr: "Sujet",
    labelAr: "الموضوع",
    placeholderFr: null,
    placeholderAr: null,
    helpTextFr: null,
    helpTextAr: null,
    options: [
      { value: "info", labelFr: "Demande d'information", labelAr: "طلب معلومات" },
      { value: "admission", labelFr: "Admission / Inscription", labelAr: "التسجيل / الولوج" },
      { value: "formation", labelFr: "Formations", labelAr: "التكوين" },
      { value: "partnership", labelFr: "Partenariat", labelAr: "شراكة" },
      { value: "other", labelFr: "Autre", labelAr: "أخرى" },
    ],
    defaultValue: null,
    isRequired: true,
    width: "full",
    order: 3,
    isPublished: true,
    buttonStyle: null,
  },
  {
    key: "message",
    type: "TEXTAREA",
    labelFr: "Message",
    labelAr: "الرسالة",
    placeholderFr: "Votre message…",
    placeholderAr: "رسالتك…",
    helpTextFr: null,
    helpTextAr: null,
    options: null,
    defaultValue: null,
    isRequired: true,
    width: "full",
    order: 4,
    isPublished: true,
    buttonStyle: null,
  },
  {
    key: "submit",
    type: "SUBMIT_BUTTON",
    labelFr: "Envoyer le message",
    labelAr: "إرسال الرسالة",
    placeholderFr: null,
    placeholderAr: null,
    helpTextFr: null,
    helpTextAr: null,
    options: null,
    defaultValue: null,
    isRequired: false,
    width: "full",
    order: 5,
    isPublished: true,
    buttonStyle: "navy",
  },
];
