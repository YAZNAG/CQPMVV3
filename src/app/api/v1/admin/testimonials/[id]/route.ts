import { z } from "zod";
import { testimonialSchema } from "@/lib/validations/testimonial";
import { executeAdminRoute } from "@/lib/api/route-handler";
import {
  deleteTestimonial,
  updateTestimonial,
} from "@/actions/admin/testimonials.actions";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return executeAdminRoute(request, {
    name: "testimonials.update",
    resource: "testimonials",
    permission: "write",
    schema: testimonialSchema,
    handler: async (data) =>
      updateTestimonial({ id, ...(data as z.infer<typeof testimonialSchema>) }),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return executeAdminRoute(request, {
    name: "testimonials.delete",
    resource: "testimonials",
    permission: "write",
    handler: async () => deleteTestimonial(id),
  });
}
