"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdmissionWizard, type AdmissionCategory } from "./admission-wizard";
import { StatusCheckForm } from "@/features/status/status-check-form";
import type {
  AdmissionFormFieldRecord,
  FormationDocumentRequirementRecord,
} from "@/services/admission-form.service";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/types";

type Tab = "register" | "track";

interface AdmissionTabsProps {
  dict: Dictionary;
  locale: Locale;
  categories: AdmissionCategory[];
  fields: AdmissionFormFieldRecord[];
  documentsByFormation: Record<string, FormationDocumentRequirementRecord[]>;
  initialTab?: Tab;
  siteName: string;
  siteAddress: string | null;
  sitePhone: string | null;
  siteEmail: string | null;
}

export function AdmissionTabs({
  dict,
  locale,
  categories,
  fields,
  documentsByFormation,
  initialTab = "register",
  siteName,
  siteAddress,
  sitePhone,
  siteEmail,
}: AdmissionTabsProps) {
  const [tab, setTab] = useState<Tab>(initialTab);

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "register", label: dict.pages.admission.register, icon: FileText },
    { id: "track", label: dict.pages.admission.track, icon: Search },
  ];

  return (
    <div>
      <div className="admission-print-hide flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all sm:flex-none sm:min-w-[220px]",
                tab === t.id
                  ? "bg-gradient-to-r from-ocean-600 to-navy-800 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-10"
      >
        {tab === "register" ? (
          <div className="admission-print-hide rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10 print:border-0 print:bg-transparent print:p-0 print:shadow-none">
            <AdmissionWizard
              dict={dict}
              locale={locale}
              categories={categories}
              fields={fields}
              documentsByFormation={documentsByFormation}
              siteName={siteName}
              siteAddress={siteAddress}
              sitePhone={sitePhone}
              siteEmail={siteEmail}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="mb-6 text-sm text-slate-600">{dict.pages.admission.trackHint}</p>
            <StatusCheckForm dict={dict} locale={locale} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
