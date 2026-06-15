"use client";

import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { Container } from "@/components/public/container";
import { resolvePartnerLogo } from "@/lib/site-images";
import { cn } from "@/lib/utils";

export type HomePartner = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
};

interface HomePartnersSectionProps {
  title: string;
  partners: HomePartner[];
  locale: "fr" | "ar";
}

function isPlaceholderLogo(logoUrl: string, name: string) {
  if (!logoUrl.includes("placehold.co")) return false;
  if (logoUrl.includes("ONP") || name.includes("Office National")) return false;
  if (logoUrl.includes("MPM") || name.includes("Ministère")) return false;
  return true;
}

function PartnerLogo({ partner }: { partner: HomePartner }) {
  const logoSrc = resolvePartnerLogo(partner.logoUrl, partner.name);
  const showPlaceholderText = !logoSrc || isPlaceholderLogo(partner.logoUrl, partner.name);

  const content = showPlaceholderText ? (
    <span className="px-2 text-center text-sm font-bold tracking-wide text-navy-800">
      {partner.name}
    </span>
  ) : (
    <img
      src={logoSrc}
      alt={partner.name}
      width={160}
      height={80}
      className="h-16 w-[160px] object-contain opacity-90 transition-opacity duration-300 group-hover/card:opacity-100"
      loading="lazy"
    />
  );

  const card = (
    <div className="group/card flex h-20 w-48 shrink-0 items-center justify-center px-3">
      {content}
    </div>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0"
        title={partner.name}
      >
        {card}
      </a>
    );
  }

  return <div className="shrink-0">{card}</div>;
}

export function HomePartnersSection({ title, partners, locale }: HomePartnersSectionProps) {
  if (partners.length === 0) return null;

  const useMarquee = partners.length >= 2;
  const track = useMarquee ? [...partners, ...partners] : partners;

  return (
    <section
      className={cn(
        "overflow-hidden border-y border-slate-200/80 bg-white py-14 lg:py-16",
        useMarquee && "group/marquee"
      )}
      id="partners"
      dir="ltr"
    >
      <Container>
        <HomeScrollReveal index={0} locale={locale}>
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-slate-300" />
          <h2
            className={cn(
              "shrink-0 text-center text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl",
              locale === "fr" && "font-serif"
            )}
          >
            {title}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300 to-slate-300" />
        </div>
        </HomeScrollReveal>

        {useMarquee ? (
          <HomeScrollReveal index={1} locale={locale} item>
          <div
            className="relative mt-10 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            }}
          >
            <div
              className={cn(
                "flex w-max gap-10 py-2",
                "animate-partners-marquee",
                "group-hover/marquee:[animation-play-state:paused]"
              )}
            >
              {track.map((partner, index) => (
                <PartnerLogo key={`${partner.id}-${index}`} partner={partner} />
              ))}
            </div>
          </div>
          </HomeScrollReveal>
        ) : (
          <HomeScrollReveal index={1} locale={locale} item>
          <div className="mt-10 flex items-center justify-center">
            <PartnerLogo partner={partners[0]} />
          </div>
          </HomeScrollReveal>
        )}
      </Container>
    </section>
  );
}
