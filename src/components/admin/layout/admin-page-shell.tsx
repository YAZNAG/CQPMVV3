import { AdminTopbar } from "./admin-topbar";

interface AdminPageShellProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminPageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <>
      <AdminTopbar
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100/60">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
      </div>
    </>
  );
}
