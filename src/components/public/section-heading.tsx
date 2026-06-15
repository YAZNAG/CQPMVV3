"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function splitTitleAccent(title: string): { main: string; accent: string } {
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 1) return { main: title, accent: "" };
  const accent = parts.pop()!;
  return { main: parts.join(" "), accent };
}

export function SectionHeading({
  label,
  title,
  titleAccent,
  description,
  align = "center",
  variant = "default",
  className,
}: {
  label?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  align?: "left" | "center";
  variant?: "default" | "featured";
  className?: string;
}) {
  const accent = titleAccent ?? splitTitleAccent(title).accent;
  const main = titleAccent !== undefined ? title : splitTitleAccent(title).main;

  const alignClass = align === "center" ? "text-center" : "text-left";

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className={cn(alignClass, className)}
      >
        {label && (
          <div
            className={cn(
              "flex items-center gap-3",
              align === "center" && "justify-center"
            )}
          >
            <span
              className="hidden h-px w-10 bg-gradient-to-r from-transparent to-ocean-400 sm:block"
              aria-hidden
            />
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-ocean-600 sm:text-sm">
              {label}
            </span>
            <span
              className="hidden h-px w-10 bg-gradient-to-l from-transparent to-ocean-400 sm:block"
              aria-hidden
            />
          </div>
        )}

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:mt-5 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          {main}
          {accent ? (
            <>
              {" "}
              <span className="font-normal text-navy-400">{accent}</span>
            </>
          ) : null}
        </h2>

        <span
          className={cn(
            "mt-5 block h-1 w-14 rounded-full bg-gradient-to-r from-navy-900 via-ocean-500 to-ocean-400",
            align === "center" && "mx-auto"
          )}
          aria-hidden
        />

        {description && (
          <p className="mx-auto mt-5 text-base leading-relaxed text-navy-600 sm:mt-6 sm:text-lg">
            {description}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={cn(align === "center" && "text-center", className)}
    >
      {label && (
        <span className="text-sm font-semibold uppercase tracking-widest text-ocean-600">
          {label}
        </span>
      )}
      <h2 className="mt-2 text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-3 text-navy-600 leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}
