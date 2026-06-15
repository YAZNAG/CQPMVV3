/**
 * Server Actions — primary mutation API for CQPM Nador.
 * REST equivalents under /api/v1/* share the same handlers where noted.
 */

export { submitApplication, checkApplicationStatus } from "./application.actions";
export { submitContactMessage } from "./contact.actions";
export { loginAction, logoutAction } from "./auth.actions";

export { updateUserAccess } from "./admin/users.actions";
export {
  reviewApplication,
  softDeleteApplication,
} from "./admin/admission.actions";
export {
  markContactMessageRead,
  markAllContactMessagesRead,
  deleteContactMessage,
} from "./admin/contact.actions";
export * from "./admin/contact-form.actions";
export * from "./admin/admission-form.actions";
export { updateSiteSettings } from "./admin/settings.actions";
export * from "./admin/news.actions";
export * from "./admin/gallery.actions";
export * from "./admin/formations.actions";
export * from "./admin/testimonials.actions";
export * from "./admin/partners.actions";
export * from "./admin/navigation.actions";
export * from "./admin/hero-slides.actions";
export * from "./admin/home-highlights.actions";
