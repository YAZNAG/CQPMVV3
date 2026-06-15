"use server";

import { runAdminAction } from "@/lib/api/action-handler";
import {
  generateMaritimeImage,
  isNanobananaConfigured,
  type NanobananaRequest,
} from "@/lib/integrations/nanobanana";
import type { ActionResult } from "@/types";
import { z } from "zod";

const generateImageSchema = z.object({
  prompt: z.string().min(8).max(500),
  style: z.enum(["maritime", "professional"]).optional(),
  aspectRatio: z.enum(["16:9", "4:3", "1:1"]).optional(),
});

export async function generateNanobananaImage(
  input: unknown
): Promise<ActionResult<{ imageUrl: string; requestId: string }>> {
  return runAdminAction({
    name: "generateNanobananaImage",
    resource: "settings",
    permission: "write",
    schema: generateImageSchema,
    input,
    handler: async (_ctx, data) => {
      if (!isNanobananaConfigured()) {
        return {
          success: false,
          error:
            "NanoBanana n'est pas configuré. Définissez NANOBANANA_API_KEY dans les variables d'environnement.",
        };
      }

      const req = data as NanobananaRequest;
      const result = await generateMaritimeImage(req);

      if (!result) {
        return {
          success: false,
          error: "La génération d'image a échoué. Vérifiez la clé API et réessayez.",
        };
      }

      return { success: true, data: result };
    },
  });
}

export async function getNanobananaStatus(): Promise<ActionResult<{ configured: boolean }>> {
  return runAdminAction({
    name: "getNanobananaStatus",
    resource: "settings",
    permission: "read",
    handler: async () => ({
      success: true,
      data: { configured: isNanobananaConfigured() },
    }),
  });
}
