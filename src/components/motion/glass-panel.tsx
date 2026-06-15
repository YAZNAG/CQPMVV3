import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark" | "ocean";
}

const styles = {
  light: "border-white/30 bg-white/75 shadow-premium backdrop-blur-xl",
  dark: "border-white/10 bg-navy-900/55 text-white shadow-premium-lg backdrop-blur-xl",
  ocean: "border-aqua-400/20 bg-gradient-to-br from-white/85 to-ocean-50/50 shadow-premium backdrop-blur-xl",
};

export function GlassPanel({ children, className, variant = "light" }: GlassPanelProps) {
  return (
    <div className={cn("rounded-2xl border", styles[variant], className)}>{children}</div>
  );
}
