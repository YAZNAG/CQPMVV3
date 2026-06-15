import { Container } from "@/components/public/container";
import { SITE_IMAGES } from "@/lib/site-images";
import { cn } from "@/lib/utils";

interface NewsHubHeroProps {
  title: string;
  subtitle: string;
  imageUrl?: string;
  compact?: boolean;
  align?: "center" | "left";
  className?: string;
}

export function NewsHubHero({
  title,
  subtitle,
  imageUrl = SITE_IMAGES.formationFallback,
  compact = false,
  align = "center",
  className,
}: NewsHubHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-navy-950",
        compact ? "min-h-[220px] md:min-h-[260px]" : "min-h-[340px] md:min-h-[420px]",
        className
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-navy-950/78" aria-hidden />
      <div className="wave-pattern absolute inset-0 opacity-10" aria-hidden />

      <Container
        className={cn(
          "relative flex flex-col justify-center py-14 md:py-16",
          compact ? "min-h-[220px] md:min-h-[260px]" : "min-h-[340px] md:min-h-[420px]",
          align === "center" ? "items-center text-center" : "items-start text-left"
        )}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p
          className={cn(
            "mt-4 text-sm leading-relaxed text-navy-100/90 md:text-base",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      </Container>
    </section>
  );
}
