import { z } from "zod";
import { formationSchema } from "@/lib/validations/formation";
import { executeAdminRoute } from "@/lib/api/route-handler";
import { deleteFormation, updateFormation } from "@/actions/admin/formations.actions";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return executeAdminRoute(request, {
    name: "formations.update",
    resource: "formations",
    permission: "write",
    schema: formationSchema,
    handler: async (data) => updateFormation({ id, ...(data as z.infer<typeof formationSchema>) }),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return executeAdminRoute(request, {
    name: "formations.delete",
    resource: "formations",
    permission: "write",
    handler: async () => deleteFormation(id),
  });
}
