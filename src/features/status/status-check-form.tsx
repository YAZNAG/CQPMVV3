"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ApplicationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkApplicationStatus } from "@/actions/application.actions";
import { STATUS_BADGE_CLASSES } from "@/lib/admission/status";
import { formatDate } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

const statusDictKeys: Record<ApplicationStatus, keyof Dictionary["status"]> = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WAITING_LIST: "waitingList",
};

interface StatusCheckFormProps {
  dict: Dictionary;
  locale: Locale;
}

export function StatusCheckForm({ dict, locale }: StatusCheckFormProps) {
  const [cin, setCin] = useState("");
  const [results, setResults] = useState<
    | {
        status: string;
        referenceNumber: string;
        updatedAt: Date;
        createdAt: Date;
        formationTitle: string;
        statusNote: string | null;
      }[]
    | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!cin.trim()) return;
    setLoading(true);
    const result = await checkApplicationStatus(cin.trim(), locale);
    setLoading(false);
    if (result.success && result.data) {
      setResults(result.data);
    } else {
      toast.error(result.error ?? dict.common.error);
      setResults(null);
    }
  };

  const dateLocale = locale === "ar" ? "ar-MA" : "fr-FR";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="status-cin">{dict.status.cin}</Label>
          <Input
            id="status-cin"
            value={cin}
            onChange={(e) => setCin(e.target.value)}
            className="border-navy-200"
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          />
        </div>
        <Button
          variant="ocean"
          onClick={handleCheck}
          disabled={loading}
          className="sm:shrink-0"
        >
          {loading ? dict.common.loading : dict.status.check}
        </Button>
      </div>

      {results && (
        <ul className="space-y-4">
          {results.map((r) => {
            const status = r.status as ApplicationStatus;
            const label = dict.status[statusDictKeys[status] ?? "pending"];
            return (
              <li
                key={r.referenceNumber}
                className="rounded-xl border border-ocean-200/60 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-navy-500">
                      {dict.admission.reference}
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold text-navy-800">
                      {r.referenceNumber}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      STATUS_BADGE_CLASSES[status] ?? STATUS_BADGE_CLASSES.PENDING
                    )}
                  >
                    {label}
                  </span>
                </div>
                <p className="mt-4 text-sm text-navy-700">
                  <span className="font-medium text-navy-500">{dict.status.formation} : </span>
                  {r.formationTitle}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-navy-500">
                  <span>
                    {dict.status.submitted} : {formatDate(r.createdAt, dateLocale)}
                  </span>
                  <span>
                    {dict.status.updated} : {formatDate(r.updatedAt, dateLocale)}
                  </span>
                </div>
                {r.statusNote && (
                  <p className="mt-4 rounded-lg bg-navy-50 p-3 text-sm text-navy-700">
                    {r.statusNote}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
