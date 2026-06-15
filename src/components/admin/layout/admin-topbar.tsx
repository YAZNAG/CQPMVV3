import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminTopbarProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function AdminTopbar({
  title,
  description,
  breadcrumbs,
  actions,
}: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="h-1 bg-gradient-to-r from-ocean-500 via-ocean-400 to-amber-400" aria-hidden />
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-300">/</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-ocean-600"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-700">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[1.65rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 bg-white shadow-sm hover:bg-slate-50"
            asChild
          >
            <Link href="/fr" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Site public</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
