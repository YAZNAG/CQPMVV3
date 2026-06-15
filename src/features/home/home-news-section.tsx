"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeScrollReveal } from "@/components/motion/home-scroll-reveal";
import { NewsCard } from "@/components/public/news-card";
import { Container } from "@/components/public/container";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/types";

export type HomeNewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  category?: string | null;
};

interface HomeNewsSectionProps {
  locale: Locale;
  articles: HomeNewsArticle[];
  hasMore?: boolean;
  ctaLabel: string;
  readMoreLabel: string;
}

export function HomeNewsSection({
  locale,
  articles,
  hasMore = false,
  ctaLabel,
  readMoreLabel,
}: HomeNewsSectionProps) {
  if (articles.length === 0) return null;

  const label = locale === "ar" ? "أخبارنا" : "Nos actualités";
  const title = locale === "ar" ? "آخر المقالات" : "Derniers articles";

  return (
    <section className="overflow-hidden bg-white py-20 lg:py-28" id="news">
      <Container>
        <HomeScrollReveal index={0} locale={locale}>
          <SectionHeading
            variant="featured"
            label={label}
            title={title}
            description={
              locale === "ar"
                ? "إعلانات وأحداث وآخر مستجدات المركز"
                : "Annonces, événements et nouvelles du centre"
            }
          />
        </HomeScrollReveal>

        <div className="mt-14 grid w-full gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-10">
          {articles.map((article, i) => (
            <HomeScrollReveal key={article.id} index={i} locale={locale} item>
              <NewsCard
                variant="home"
                locale={locale}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                coverImageUrl={article.coverImageUrl}
                publishedAt={article.publishedAt}
                category={article.category}
                ctaLabel={readMoreLabel}
                index={i}
                animateEntrance={false}
              />
            </HomeScrollReveal>
          ))}
        </div>

        {hasMore && (
          <HomeScrollReveal index={1} locale={locale} className="mt-14 text-center lg:mt-16">
            <Button
              variant="outline"
              size="lg"
              className="min-w-[10rem] border-navy-200 bg-white px-8 hover:bg-navy-50"
              asChild
            >
              <Link href={`/${locale}/news`}>
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </HomeScrollReveal>
        )}
      </Container>
    </section>
  );
}
