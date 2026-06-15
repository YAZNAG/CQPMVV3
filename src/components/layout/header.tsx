"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HashLink } from "@/components/layout/hash-link";
import { SiteBrandLogo } from "@/components/layout/site-brand-logo";
import { parseHashHref, sectionIdFromPageLink } from "@/lib/navigation/hash-nav";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  X,
} from "lucide-react";
import { PAGE_GUTTER } from "@/components/public/container";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { PublicNavItem } from "@/services/navigation.service";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
  siteNameFr: string;
  siteNameAr: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  addressFr?: string | null;
  addressAr?: string | null;
  navItems: PublicNavItem[];
  ctaButtons?: PublicNavItem[];
}

function isActive(pathname: string, item: PublicNavItem, activeSection: string): boolean {
  const { path, hash } = parseHashHref(item.href);

  if (hash) {
    return pathname === path && activeSection === hash;
  }

  if (activeSection) {
    const segment = sectionIdFromPageLink(item.href, pathname);
    if (segment === activeSection) return true;
  }

  if (item.exact) {
    return pathname === item.href && !activeSection;
  }
  if (item.children?.some((child) => isActive(pathname, child, activeSection))) {
    return true;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavLink({
  item,
  pathname,
  locationHash,
  className,
  onNavigate,
}: {
  item: PublicNavItem;
  pathname: string;
  locationHash: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, item, locationHash);
  const linkProps = item.openInNewTab
    ? { target: "_blank" as const, rel: "noopener noreferrer" as const }
    : {};
  const LinkComponent = item.openInNewTab ? Link : HashLink;

  return (
    <LinkComponent
      href={item.href}
      className={className}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      {...linkProps}
    >
      {item.label}
    </LinkComponent>
  );
}

const navLinkClass = (active: boolean) =>
  cn(
    "relative inline-flex items-center gap-1 px-3 py-4 text-[13px] font-semibold tracking-wide transition-colors",
    active
      ? "text-blue-600 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-blue-600"
      : "text-slate-800 hover:text-blue-600"
  );

const dropdownClass = (active: boolean) =>
  cn(
    "block px-4 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-blue-50 text-blue-700"
      : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
  );

function DesktopNavItem({
  item,
  pathname,
  locationHash,
}: {
  item: PublicNavItem;
  pathname: string;
  locationHash: string;
}) {
  const active = isActive(pathname, item, locationHash);
  const hasChildren = !!item.children?.length;

  if (!hasChildren) {
    return (
      <NavLink
        item={item}
        pathname={pathname}
        locationHash={locationHash}
        className={navLinkClass(active)}
      />
    );
  }

  const triggerClass = navLinkClass(active);

  return (
    <div className="group relative">
      {item.dropdownOnly ? (
        <button
          type="button"
          className={cn(triggerClass, "cursor-default bg-transparent")}
          aria-haspopup="true"
          aria-expanded="false"
        >
          {item.label}
          <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:rotate-180" />
        </button>
      ) : (
        <div className="inline-flex items-center">
          <NavLink
            item={item}
            pathname={pathname}
            locationHash={locationHash}
            className={triggerClass}
          />
          <ChevronDown className="-ms-1 me-1 h-3.5 w-3.5 text-slate-500 opacity-60 transition-transform group-hover:rotate-180" />
        </div>
      )}
      <div className="invisible absolute top-full z-50 min-w-[14rem] rounded-lg border border-slate-100 bg-white py-1.5 opacity-0 shadow-xl shadow-slate-900/10 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ltr:left-0 rtl:right-0">
        {item.children!.map((child) => (
          <NavLink
            key={child.id}
            item={child}
            pathname={pathname}
            locationHash={locationHash}
            className={dropdownClass(isActive(pathname, child, locationHash))}
          />
        ))}
      </div>
    </div>
  );
}

function MobileNavItems({
  items,
  pathname,
  locationHash,
  depth = 0,
  onNavigate,
}: {
  items: PublicNavItem[];
  pathname: string;
  locationHash: string;
  depth?: number;
  onNavigate: () => void;
}) {
  return items.map((item) => (
    <div key={item.id} style={{ paddingInlineStart: depth * 12 }}>
      {!item.dropdownOnly || !item.children?.length ? (
        <NavLink
          item={item}
          pathname={pathname}
          locationHash={locationHash}
          className={cn(
            "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
            item.children?.length
              ? "text-xs font-bold uppercase tracking-wider text-blue-700"
              : "text-slate-800 hover:bg-blue-50 hover:text-blue-800"
          )}
          onNavigate={onNavigate}
        />
      ) : (
        <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">
          {item.label}
        </p>
      )}
      {item.children && item.children.length > 0 && (
        <MobileNavItems
          items={item.children}
          pathname={pathname}
          locationHash={locationHash}
          depth={depth + 1}
          onNavigate={onNavigate}
        />
      )}
    </div>
  ));
}

function CtaButtons({
  buttons,
  className,
  onNavigate,
}: {
  buttons: PublicNavItem[];
  className?: string;
  onNavigate?: () => void;
}) {
  return buttons.map((button) => {
    const linkProps = button.openInNewTab
      ? { target: "_blank" as const, rel: "noopener noreferrer" as const }
      : {};
    return (
      <Button
        key={button.id}
        size="sm"
        className={cn(
          "h-10 rounded-lg border-0 bg-gradient-to-r from-amber-500 to-orange-500 px-5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 hover:from-amber-400 hover:to-orange-400",
          className
        )}
        asChild
      >
        <Link href={button.href} onClick={onNavigate} {...linkProps}>
          {button.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  });
}

export function Header({
  locale,
  dict,
  siteNameFr,
  siteNameAr,
  logoUrl,
  phone,
  email,
  addressFr,
  addressAr,
  navItems,
  ctaButtons,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [locationHash, setLocationHash] = useState("");

  useEffect(() => {
    const sync = () => setLocationHash(window.location.hash.replace(/^#/, ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  const isRtl = locale === "ar";
  const siteName = isRtl ? siteNameAr : siteNameFr;
  const address = isRtl ? addressAr : addressFr;
  const scrollSpySection = useScrollSpy(navItems, pathname);
  const effectiveSection = scrollSpySection || locationHash;
  const buttons =
    ctaButtons ??
    [
      {
        id: "fallback-cta",
        href: `/${locale}/admission`,
        label: dict.hero.ctaRegister,
      },
    ];

  return (
    <header id="site-header" className="sticky top-0 z-50 w-full bg-white shadow-sm shadow-slate-900/5">
      <div className="hidden border-b border-white/10 bg-slate-950 text-white lg:block">
        <div
          className={cn(
            "flex h-9 w-full items-center justify-between gap-4 text-[11px] font-medium",
            PAGE_GUTTER
          )}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-orange-300"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 opacity-80" />
                <span>{phone}</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-orange-300"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 opacity-80" />
                <span>{email}</span>
              </a>
            )}
            {address && (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-white/90">
                <MapPin className="h-3.5 w-3.5 shrink-0 opacity-80" />
                <span className="truncate">{address}</span>
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-white/90">
              <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" />
              {dict.header.hours}
            </span>
            <LanguageSwitcher currentLocale={locale} pathname={pathname} variant="topbar" />
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100">
        <div className={cn("flex h-[4.25rem] w-full items-center justify-between gap-4", PAGE_GUTTER)}>
          <Link
            href={`/${locale}`}
            className="flex shrink-0 items-center gap-3"
            aria-label={siteName}
          >
            <SiteBrandLogo logoUrl={logoUrl} size="xl" />
            <p className="hidden text-lg font-bold tracking-tight text-slate-900 sm:block">
              {siteName}
            </p>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex" aria-label="Main">
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.id}
                item={item}
                pathname={pathname}
                locationHash={effectiveSection}
              />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href={`/${locale}/news`}
              className="hidden rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600 md:inline-flex"
              aria-label={dict.header.search}
            >
              <Search className="h-5 w-5" />
            </Link>
            <div className="hidden lg:flex">
              <CtaButtons buttons={buttons} />
            </div>
            <div className="lg:hidden">
              <LanguageSwitcher currentLocale={locale} pathname={pathname} variant="compact" />
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-800 xl:hidden"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white xl:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1 p-4">
              <MobileNavItems
                items={navItems}
                pathname={pathname}
                locationHash={effectiveSection}
                onNavigate={() => setOpen(false)}
              />
              <div className="mt-2 flex flex-col gap-2">
                <CtaButtons
                  buttons={buttons}
                  className="w-full justify-center"
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
