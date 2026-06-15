import { auth } from "@/lib/auth/auth-instance";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { AdminLayoutShell } from "@/components/admin/layout/admin-layout-shell";
import { StorageConfigProvider } from "@/components/admin/storage-config-provider";
import { getAdminNavBadges } from "@/services/admin-dashboard.service";
import { getSiteSettings } from "@/services/site-settings.service";
import { isCloudStorageEnabled } from "@/lib/storage-config";
import type { UserRole } from "@prisma/client";
import { Toaster } from "sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-100 antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </div>
    );
  }

  const role = session.user.role as UserRole;
  const [badges, settings] = await Promise.all([
    getAdminNavBadges(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-slate-100/80 font-sans antialiased">
      <AuthSessionProvider>
        <StorageConfigProvider cloudEnabled={isCloudStorageEnabled()}>
          <AdminLayoutShell
            role={role}
            email={session.user.email ?? ""}
            name={session.user.name ?? null}
            badges={badges}
            logoUrl={settings.logoUrl}
            siteNameFr={settings.siteNameFr}
          >
            {children}
          </AdminLayoutShell>
        </StorageConfigProvider>
        <Toaster richColors position="top-right" />
      </AuthSessionProvider>
    </div>
  );
}
