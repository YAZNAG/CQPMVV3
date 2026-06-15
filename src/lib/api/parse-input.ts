import type { ZodSchema } from "zod";
import type { ActionResult } from "@/types";

export function validationError(
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return {
    success: false,
    error: "Données invalides",
    fieldErrors,
  };
}

export function parseInput<T>(
  schema: ZodSchema<T>,
  input: unknown
): { ok: true; data: T } | { ok: false; result: ActionResult<never> } {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      result: validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      ),
    };
  }
  return { ok: true, data: parsed.data };
}
