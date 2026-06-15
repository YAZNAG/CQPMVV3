import { createAdminRouteHandler } from "@/lib/api";
import { markAllContactMessagesRead } from "@/actions/admin/contact.actions";

export const POST = createAdminRouteHandler({
  name: "contact.markAllRead",
  methods: ["POST"],
  resource: "contact",
  permission: "write",
  handler: async () => markAllContactMessagesRead(),
});
