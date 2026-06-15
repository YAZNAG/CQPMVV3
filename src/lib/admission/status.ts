import type { ApplicationStatus } from "@prisma/client";

export const APPLICATION_STATUS_LABELS: Record<
  ApplicationStatus,
  { fr: string; ar: string; admin: string }
> = {
  PENDING: {
    fr: "En attente",
    ar: "قيد الانتظار",
    admin: "En attente",
  },
  ACCEPTED: {
    fr: "Acceptée",
    ar: "مقبولة",
    admin: "Acceptée",
  },
  REJECTED: {
    fr: "Refusée",
    ar: "مرفوضة",
    admin: "Refusée",
  },
  WAITING_LIST: {
    fr: "Liste d'attente",
    ar: "لائحة الانتظار",
    admin: "Liste d'attente",
  },
};

export const STATUS_BADGE_CLASSES: Record<ApplicationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  ACCEPTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  WAITING_LIST: "bg-sky-100 text-sky-800 border-sky-200",
};
