"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import {
  handleSamePageHashNav,
  parseHashHref,
} from "@/lib/navigation/hash-nav";

type HashLinkProps = ComponentProps<typeof Link>;

export function HashLink({ href, onClick, ...props }: HashLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hrefString = typeof href === "string" ? href : href.pathname ?? "";

  return (
    <Link href={href} scroll={false} {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (typeof hrefString !== "string") return;

        const { path, hash } = parseHashHref(hrefString);
        if (!hash) return;

        if (pathname === path) {
          if (handleSamePageHashNav(hrefString, pathname)) {
            e.preventDefault();
          }
          return;
        }

        e.preventDefault();
        router.push(hrefString, { scroll: false });
      }}
    />
  );
}
