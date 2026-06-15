import type { ActionResult } from "@/types";

export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT"
  | "INTERNAL";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status: number = 400,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }
}

const CODE_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Authentification requise.",
  FORBIDDEN: "Accès refusé.",
};

export function mapAuthError(error: unknown): AppError | null {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return new AppError("UNAUTHORIZED", CODE_MESSAGES.UNAUTHORIZED, 401);
    }
    if (error.message === "FORBIDDEN") {
      return new AppError("FORBIDDEN", CODE_MESSAGES.FORBIDDEN, 403);
    }
  }
  return null;
}

export function toActionResult<T = void>(error: unknown): ActionResult<T> {
  const authErr = mapAuthError(error);
  if (authErr) {
    return { success: false, error: authErr.message };
  }
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      fieldErrors: error.fieldErrors,
    };
  }
  if (error instanceof Error && error.name === "PrismaClientValidationError") {
    return {
      success: false,
      error:
        "Le serveur doit être redémarré après une mise à jour (Prisma). Arrêtez puis relancez npm run dev.",
    };
  }
  return { success: false, error: "Une erreur inattendue s'est produite." };
}

export function toHttpStatus(error: unknown, success: boolean): number {
  if (success) return 200;
  if (error instanceof AppError) return error.status;
  const authErr = mapAuthError(error);
  if (authErr) return authErr.status;
  return 500;
}
