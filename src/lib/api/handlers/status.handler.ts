import { getApplicationsByCin } from "@/services/application.service";
import type { ApplicationStatusInput } from "@/lib/validations/application";
import type { ActionResult, Locale } from "@/types";

export async function checkApplicationStatusHandler(
  data: ApplicationStatusInput,
  locale: Locale = "fr"
): Promise<
  ActionResult<
    {
      status: string;
      referenceNumber: string;
      updatedAt: Date;
      createdAt: Date;
      formationTitle: string;
      statusNote: string | null;
    }[]
  >
> {
  const applications = await getApplicationsByCin(data.cin, locale);

  if (!applications.length) {
    return { success: false, error: "Aucune candidature trouvée pour ce CIN." };
  }

  return { success: true, data: applications };
}
