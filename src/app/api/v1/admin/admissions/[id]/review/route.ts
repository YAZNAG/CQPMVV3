import { reviewApplicationSchema } from "@/lib/validations/admission";
import { executeAdminRoute } from "@/lib/api/route-handler";
import { reviewApplication } from "@/actions/admin/admission.actions";
import type { z } from "zod";

const bodySchema = reviewApplicationSchema.omit({ id: true });
type ReviewBody = z.infer<typeof bodySchema>;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return executeAdminRoute(request, {
    name: "admissions.review",
    resource: "admissions",
    permission: "write",
    schema: bodySchema,
    handler: async (data) =>
      reviewApplication({ id, ...(data as ReviewBody) }),
  });
}
