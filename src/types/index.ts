import type {
  ApplicationStatus,
  GalleryItemType,
  UserRole,
} from "@prisma/client";

export type Locale = "fr" | "ar";

export const LOCALES: Locale[] = ["fr", "ar"];
export const DEFAULT_LOCALE: Locale = "fr";

export type LocalizedField<T> = {
  fr: T;
  ar: T;
};

export function getLocalized<T extends string>(
  locale: Locale,
  fr: T,
  ar: T
): T {
  return locale === "ar" ? ar : fr;
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
};

export type ApplicationStatusType = ApplicationStatus;
export type GalleryItemTypeValue = GalleryItemType;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
