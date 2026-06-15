import { cn } from "@/lib/utils";

/** Shared horizontal padding for full-width public layout */
export const PAGE_GUTTER = "px-4 sm:px-5 lg:px-6 xl:px-8";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("w-full", PAGE_GUTTER, className)}>{children}</div>;
}
