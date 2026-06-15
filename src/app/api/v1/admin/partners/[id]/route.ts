import { z } from "zod";
import { partnerSchema } from "@/lib/validations/partner";
import { executeAdminRoute } from "@/lib/api/route-handler";
import { deletePartner, updatePartner } from "@/actions/admin/partners.actions";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return executeAdminRoute(request, {
    name: "partners.update",
    resource: "formations",
    permission: "write",
    schema: partnerSchema,
    handler: async (data) =>
      updatePartner({ id, ...(data as z.infer<typeof partnerSchema>) }),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return executeAdminRoute(request, {
    name: "partners.delete",
    resource: "formations",
    permission: "write",
    handler: async () => deletePartner(id),
  });
}
