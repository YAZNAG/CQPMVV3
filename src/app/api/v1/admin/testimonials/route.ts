import { testimonialSchema } from "@/lib/validations/testimonial";
import { createAdminRouteHandler } from "@/lib/api";
import { createTestimonial } from "@/actions/admin/testimonials.actions";

export const POST = createAdminRouteHandler({
  name: "testimonials.create",
  methods: ["POST"],
  resource: "testimonials",
  permission: "write",
  schema: testimonialSchema,
  handler: async (data) => createTestimonial(data),
});
