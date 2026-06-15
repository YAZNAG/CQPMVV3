import { requirePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/services/site-settings.service";
import { listAdminContactFormFields } from "@/services/contact-form.service";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { ContactInbox } from "@/components/admin/contact-inbox";
import { ContactAdminTabs, type ContactAdminTab } from "@/components/admin/contact-admin-tabs";
import { ContactFormManager } from "@/components/admin/contact-form-manager";
import { ContactPageSettings } from "@/components/admin/contact-page-settings";

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requirePermission("contact", "read");
  const canWrite = hasPermission(session.user.role, "contact", "write");
  const { tab: rawTab } = await searchParams;
  const tab: ContactAdminTab =
    rawTab === "form" || rawTab === "settings" ? rawTab : "messages";

  const [messages, fields, settings] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    listAdminContactFormFields(),
    getSiteSettings(),
  ]);

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <AdminPageShell
      title="Contact"
      description="Messages reçus, formulaire dynamique et coordonnées de la page /contact."
      breadcrumbs={[
        { label: "Administration", href: "/admin" },
        { label: "Contact" },
      ]}
    >
      <ContactAdminTabs active={tab} unread={unread} />

      {tab === "messages" && (
        <ContactInbox
          messages={messages.map((m) => ({
            ...m,
            formData:
              m.formData && typeof m.formData === "object" && !Array.isArray(m.formData)
                ? (m.formData as Record<string, unknown>)
                : null,
          }))}
          canWrite={canWrite}
        />
      )}

      {tab === "form" && <ContactFormManager fields={fields} canWrite={canWrite} />}

      {tab === "settings" && (
        <ContactPageSettings
          canWrite={canWrite}
          initial={{
            email: settings.email ?? "",
            phone: settings.phone ?? "",
            addressFr: settings.addressFr ?? "",
            addressAr: settings.addressAr ?? "",
            contactHoursFr:
              settings.contactHoursFr ?? "Lundi — Vendredi, 8h30 — 16h30",
            contactHoursAr: settings.contactHoursAr ?? "",
            contactIntroFr: settings.contactIntroFr ?? "",
            contactIntroAr: settings.contactIntroAr ?? "",
            contactMapUrl: settings.contactMapUrl ?? "",
          }}
        />
      )}
    </AdminPageShell>
  );
}
