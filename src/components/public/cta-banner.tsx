"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "./container";

interface CtaBannerProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CtaBanner({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CtaBannerProps) {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-20">
      <div className="wave-pattern absolute inset-0 opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ocean-600/20 to-transparent" />
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
          <p className="mt-4 text-navy-100/90">{description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button variant="ocean" size="lg" asChild>
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            {secondaryLabel && secondaryHref && (
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
