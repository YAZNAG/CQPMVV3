"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  GraduationCap,
  Ship,
} from "lucide-react";
import { FormationCard } from "@/components/public/formation-card";
import { CmsImage } from "@/components/public/cms-image";
import { Container } from "@/components/public/container";
import { Button } from "@/components/ui/button";
import { getCategoryUi } from "@/lib/formation-ui";
import { resolveFormationImage, SITE_IMAGES } from "@/lib/site-images";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

export type FormationCatalogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  formations: {
    id: string;
    slug: string;
    title: string;
    description: string;
    duration: string;
    imageUrl: string | null;
  }[];
};

interface FormationsCatalogProps {
  locale: Locale;
  categories: FormationCatalogCategory[];
  activeCategory?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  ctaLabel: string;
  discoverLabel: string;
  allFormationsLabel: string;
}

export function FormationsCatalog({
  locale,
  categories,
  activeCategory,
  heroTitle,
  heroSubtitle,
  heroDescription,
  ctaLabel,
  discoverLabel,
  allFormationsLabel,
}: FormationsCatalogProps) {
  const filtered = activeCategory
    ? categories.filter((c) => c.slug === activeCategory)
    : categories;

  const activeCat = activeCategory
    ? categories.find((c) => c.slug === activeCategory)
    : null;

  return (
    <>
      <section className="relative min-h-[340px] overflow-hidden bg-navy-950 md:min-h-[400px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${SITE_IMAGES.formationFallback})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-navy-950/78" aria-hidden />
        <div className="wave-pattern absolute inset-0 opacity-15" aria-hidden />

        <Container className="relative flex min-h-[340px] flex-col items-center justify-center py-16 text-center md:min-h-[400px] md:py-20">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            <BookOpen className="h-3.5 w-3.5" />
            {locale === "ar" ? "دليل 2024-2025" : "Catalogue 2024-2025"}
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {heroTitle}
          </h1>
          <p className="mt-2 text-lg font-medium text-sky-300/90 md:text-xl">{heroSubtitle}</p>
          <p className="mx-auto mt-5 text-sm leading-relaxed text-navy-100/85 md:text-base">
            {heroDescription}
          </p>
        </Container>
      </section>

      <div className="border-b border-slate-200 bg-white">
        <Container className="py-4">
          <nav
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={locale === "ar" ? "تصفية حسب الفئة" : "Filtrer par catégorie"}
          >
            <FilterPill
              href={`/${locale}/formations`}
              active={!activeCategory}
              label={allFormationsLabel}
            />
            {categories.map((cat) => (
              <FilterPill
                key={cat.slug}
                href={`/${locale}/formations?category=${cat.slug}`}
                active={activeCategory === cat.slug}
                label={cat.name}
              />
            ))}
          </nav>
        </Container>
      </div>

      {activeCat ? (
        <CategoryDetailView
          locale={locale}
          category={activeCat}
          ctaLabel={ctaLabel}
          discoverLabel={discoverLabel}
        />
      ) : (
        <OverviewSections
          locale={locale}
          categories={filtered}
          discoverLabel={discoverLabel}
        />
      )}
    </>
  );
}

function OverviewSections({
  locale,
  categories,
  discoverLabel,
}: {
  locale: Locale;
  categories: FormationCatalogCategory[];
  discoverLabel: string;
}) {
  return (
    <section className="bg-[#f4f6f8] py-16 md:py-24">
      <Container className="space-y-20 md:space-y-28">
        {categories.map((cat, index) => {
          const ui = getCategoryUi(cat.slug, locale);
          const image =
            resolveFormationImage(cat.formations[0]?.imageUrl, cat.formations[0]?.slug) ??
            SITE_IMAGES.formationFallback;
          const reversed = index % 2 === 1;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55 }}
              className={cn(
                "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
                reversed && "lg:[direction:rtl] lg:*:[direction:ltr]"
              )}
            >
              <div>
                <span className="inline-block rounded-md bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ocean-700">
                  {ui.levelBadge}
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
                  {ui.sectionTitle}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
                  {cat.description}
                </p>
                {cat.formations.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {cat.formations.slice(0, 4).map((f) => (
                      <li key={f.id} className="flex items-start gap-3 text-sm text-navy-800">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ocean-100 text-ocean-600">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {f.title}
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  asChild
                  className="mt-8 rounded-lg bg-navy-900 px-6 hover:bg-navy-800"
                >
                  <Link href={`/${locale}/formations?category=${cat.slug}`}>
                    {discoverLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5">
                <CmsImage
                  src={image}
                  alt={ui.sectionTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          );
        })}
      </Container>
    </section>
  );
}

function CategoryDetailView({
  locale,
  category,
  ctaLabel,
  discoverLabel,
}: {
  locale: Locale;
  category: FormationCatalogCategory;
  ctaLabel: string;
  discoverLabel: string;
}) {
  const ui = getCategoryUi(category.slug, locale);
  const heroImage =
    resolveFormationImage(category.formations[0]?.imageUrl, category.formations[0]?.slug) ??
    SITE_IMAGES.formationFallback;

  return (
    <>
      <section className="bg-white py-14 md:py-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-block rounded-md bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ocean-700">
                {ui.levelBadge}
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                {ui.sectionTitle}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                {category.description}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <FeatureMini
                  icon={GraduationCap}
                  title={locale === "ar" ? "شهادة معترف بها" : "Diplôme Reconnu"}
                  text={
                    locale === "ar"
                      ? "تأهيل مهني معتمد من قطاع الصيد البحري"
                      : "Qualification reconnue par le secteur des pêches"
                  }
                />
                <FeatureMini
                  icon={Ship}
                  title={locale === "ar" ? "تطبيق عملي" : "Immersion Pratique"}
                  text={
                    locale === "ar"
                      ? "تكوين ميداني على متن السفن وفي الورشات"
                      : "Formation terrain en mer et en atelier"
                  }
                />
              </div>
            </div>
            <div className="relative aspect-[3/4] max-h-[480px] overflow-hidden rounded-2xl shadow-premium-lg ring-1 ring-navy-900/10">
              <CmsImage
                src={heroImage}
                alt={ui.sectionTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#f4f6f8] py-14 md:py-20">
        <Container>
          <div className="mb-10 text-center">
            <h3 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              {locale === "ar" ? "شعبنا" : "Nos Filières"}
            </h3>
            <p className="mx-auto mt-3 text-sm text-slate-600 md:text-base">
              {locale === "ar"
                ? "اكتشفوا التكوينات المتاحة في هذه الفئة"
                : "Découvrez les parcours disponibles dans cette catégorie"}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {category.formations.map((f, i) => (
              <FormationCard
                key={f.id}
                variant="premium"
                locale={locale}
                slug={f.slug}
                title={f.title}
                description={f.description}
                duration={f.duration}
                imageUrl={f.imageUrl}
                category={ui.sectionTitle}
                ctaLabel={ctaLabel}
                secondaryCtaLabel={discoverLabel}
                index={i}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function FeatureMini({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <Icon className="mb-2 h-5 w-5 text-ocean-600" />
      <p className="text-sm font-semibold text-navy-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-navy-900 text-white shadow-md"
          : "text-navy-700 hover:bg-slate-100"
      )}
    >
      {label}
    </Link>
  );
}
