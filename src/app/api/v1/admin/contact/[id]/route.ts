import { executeAdminRoute } from "@/lib/api/route-handler";
import {
  deleteContactMessage,
  markContactMessageRead,
} from "@/actions/admin/contact.actions";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return executeAdminRoute(request, {
    name: "contact.markRead",
    resource: "contact",
    permission: "write",
    handler: async () => markContactMessageRead(id),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return executeAdminRoute(request, {
    name: "contact.delete",
    resource: "contact",
    permission: "write",
    handler: async () => deleteContactMessage(id),
  });
}
