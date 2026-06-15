import { Anchor } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteBrandLogoProps {
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "light" | "dark";
}

const sizeClasses = {
  sm: "max-h-9",
  md: "max-h-11",
  lg: "max-h-12",
  xl: "max-h-14 sm:max-h-16",
};

const iconBoxClasses = {
  sm: "h-9 w-9 rounded-lg",
  md: "h-11 w-11 rounded-xl",
  lg: "h-12 w-12 rounded-xl",
  xl: "h-14 w-14 rounded-xl sm:h-16 sm:w-16",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-6 w-6",
  xl: "h-7 w-7 sm:h-8 sm:w-8",
};

export function SiteBrandLogo({
  logoUrl,
  size = "md",
  className,
  variant = "light",
}: SiteBrandLogoProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={cn(
          "h-auto w-auto shrink-0 object-contain",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center shadow-md",
        variant === "dark"
          ? "bg-ocean-500 text-white"
          : "bg-gradient-to-br from-navy-800 to-ocean-600 text-white",
        iconBoxClasses[size],
        className
      )}
    >
      <Anchor className={iconSizes[size]} aria-hidden />
    </span>
  );
}
