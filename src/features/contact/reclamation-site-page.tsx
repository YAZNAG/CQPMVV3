"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Container } from "@/components/public/container";
import { ContactSubNav } from "@/features/contact/contact-sub-nav";
import {
  submitReclamationAction,
  trackReclamationAction,
} from "@/actions/reclamation.actions";
import { cn, formatDate } from "@/lib/utils";
import type { Locale } from "@/types";

interface ReclamationSitePageProps {
  locale: Locale;
  contactInfo: {
    phone: string | null;
    email: string | null;
    hours: string;
    address: string;
  };
  labels: {
    heroTitle: string;
    heroTitleAr: string;
    heroSubtitle: string;
    subNav: { contact: string; reclamation: string };
    procedureTitle: string;
    steps: string[];
    formTitle: string;
    formSubtitle: string;
    fields: {
      name: string;
      cin: string;
      phone: string;
      email: string;
      type: string;
      subject: string;
      description: string;
      attachment: string;
      attachmentHint: string;
    };
    types: { value: string; label: string }[];
    submit: string;
    success: string;
    successHint: string;
    referenceLabel: string;
    trackTitle: string;
    trackReference: string;
    trackEmail: string;
    trackSubmit: string;
    trackResult: string;
    infoTitle: string;
    infoItems: string[];
    quickContactTitle: string;
    bottomTitle: string;
    bottomSubtitle: string;
    bottomContact: string;
    bottomFormations: string;
    loading: string;
    error: string;
  };
}

export function ReclamationSitePage({ locale, contactInfo, labels }: ReclamationSitePageProps) {
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [trackResult, setTrackResult] = useState<{
    reference: string;
    subject: string;
    status: string;
    updatedAt: Date;
    responseNote: string | null;
  } | null>(null);
  const [type, setType] = useState("ADMINISTRATIVE");
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-FR";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await submitReclamationAction({
      name: String(fd.get("name") ?? ""),
      cin: String(fd.get("cin") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      type,
      subject: String(fd.get("subject") ?? ""),
      description: String(fd.get("description") ?? ""),
      attachmentUrl,
    });
    setLoading(false);

    if (result.success && result.data) {
      setSubmittedRef(result.data.reference);
      toast.success(labels.success);
      e.currentTarget.reset();
      setAttachmentUrl(null);
    } else {
      toast.error(result.error ?? labels.error);
    }
  }

  async function onTrack(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTracking(true);
    const fd = new FormData(e.currentTarget);
    const result = await trackReclamationAction(
      {
        reference: String(fd.get("reference") ?? ""),
        email: String(fd.get("trackEmail") ?? ""),
      },
      locale
    );
    setTracking(false);

    if (result.success && result.data) {
      setTrackResult(result.data);
    } else {
      setTrackResult(null);
      toast.error(result.error ?? labels.error);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8rem] font-black uppercase tracking-[0.2em] text-white/[0.03] sm:text-[12rem]"
          aria-hidden
        >
          RECLAMATION
        </div>
        <Container className="relative text-center">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            {labels.heroTitle}{" "}
            <span className="text-navy-300">/ {labels.heroTitleAr}</span>
          </h1>
          <p className="mx-auto mt-4 text-sm leading-relaxed text-navy-100/90 sm:text-base">
            {labels.heroSubtitle}
          </p>
        </Container>
      </section>

      <section className="border-b border-slate-200/80 bg-white py-5">
        <Container>
          <ContactSubNav locale={locale} active="reclamation" labels={labels.subNav} />
        </Container>
      </section>

      <section className="bg-slate-50/80 py-12 lg:py-16">
        <Container>
          <h2 className="text-lg font-bold text-navy-900">{labels.procedureTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {labels.steps.map((step, index) => (
              <li
                key={step}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm"
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm font-medium leading-snug text-slate-600">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-navy-900">{labels.formTitle}</h2>
              <p className="mt-2 text-sm text-slate-500">{labels.formSubtitle}</p>

              {submittedRef ? (
                <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <p className="text-sm font-semibold text-emerald-800">{labels.success}</p>
                  <p className="mt-2 text-xs text-emerald-700">{labels.referenceLabel}</p>
                  <p className="mt-1 font-mono text-lg font-bold text-emerald-900">{submittedRef}</p>
                  <p className="mt-3 text-xs text-emerald-700">{labels.successHint}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSubmittedRef(null)}
                  >
                    {labels.formTitle}
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={labels.fields.name} name="name" required />
                    <Field label={labels.fields.cin} name="cin" required />
                    <Field label={labels.fields.phone} name="phone" type="tel" required />
                    <Field label={labels.fields.email} name="email" type="email" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">{labels.fields.type}</Label>
                    <select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                      required
                    >
                      {labels.types.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Field label={labels.fields.subject} name="subject" className="sm:col-span-2" required />

                  <div className="space-y-2">
                    <Label htmlFor="description">{labels.fields.description}</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      rows={6}
                      className="border-slate-200 bg-white"
                    />
                  </div>

                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-center">
                    <Upload className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
                    <p className="mt-2 text-sm font-medium text-navy-900">{labels.fields.attachment}</p>
                    <p className="mt-1 text-xs text-slate-500">{labels.fields.attachmentHint}</p>
                    <div className="mt-4 flex justify-center">
                      <UploadButton
                        endpoint="reclamationAttachment"
                        onClientUploadComplete={(res) => {
                          setAttachmentUrl(res[0]?.url ?? null);
                          toast.success("Fichier téléversé");
                        }}
                        onUploadError={() => toast.error(labels.error)}
                        appearance={{
                          button:
                            "bg-navy-900 text-white text-sm px-4 py-2 rounded-lg ut-uploading:opacity-50",
                          allowedContent: "hidden",
                        }}
                        content={{ button: attachmentUrl ? "Remplacer" : "Choisir un fichier" }}
                      />
                    </div>
                    {attachmentUrl && (
                      <p className="mt-2 truncate text-xs text-emerald-700">{attachmentUrl}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-navy-900 py-6 text-base hover:bg-navy-800 sm:w-auto sm:px-10"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {labels.loading}
                      </>
                    ) : (
                      labels.submit
                    )}
                  </Button>
                </form>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-navy-900">{labels.trackTitle}</h3>
                <form onSubmit={onTrack} className="mt-4 space-y-4">
                  <Field label={labels.trackReference} name="reference" required />
                  <Field label={labels.trackEmail} name="trackEmail" type="email" required />
                  <Button type="submit" variant="ocean" disabled={tracking} className="w-full">
                    {tracking ? labels.loading : labels.trackSubmit}
                  </Button>
                </form>
                {trackResult && (
                  <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm">
                    <p className="font-semibold text-navy-900">{labels.trackResult}</p>
                    <p className="mt-2 font-mono text-xs text-slate-600">{trackResult.reference}</p>
                    <p className="mt-1 font-medium text-navy-800">{trackResult.subject}</p>
                    <p className="mt-2 text-ocean-700">{trackResult.status}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(trackResult.updatedAt, dateLocale)}
                    </p>
                    {trackResult.responseNote && (
                      <p className="mt-3 text-xs leading-relaxed text-slate-600">
                        {trackResult.responseNote}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200/80 border-l-4 border-l-ocean-500 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-navy-900">{labels.infoTitle}</h3>
                <ul className="mt-4 space-y-3">
                  {labels.infoItems.map((item, i) => (
                    <li key={item} className="flex gap-3 text-sm text-slate-600">
                      <span className="mt-0.5 text-ocean-600">
                        {i === 0 && <Clock className="h-4 w-4" />}
                        {i === 1 && <Shield className="h-4 w-4" />}
                        {i === 2 && <Mail className="h-4 w-4" />}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-navy-950 p-6 text-white shadow-lg">
                <h3 className="text-base font-bold">{labels.quickContactTitle}</h3>
                <ul className="mt-4 space-y-3 text-sm text-navy-100">
                  {contactInfo.phone && (
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-ocean-300" />
                      <a href={`tel:${contactInfo.phone}`} className="hover:text-white">
                        {contactInfo.phone}
                      </a>
                    </li>
                  )}
                  {contactInfo.email && (
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-ocean-300" />
                      <a href={`mailto:${contactInfo.email}`} className="hover:text-white">
                        {contactInfo.email}
                      </a>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ocean-300" />
                    {contactInfo.hours}
                  </li>
                  {contactInfo.address && (
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ocean-300" />
                      {contactInfo.address}
                    </li>
                  )}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-t border-slate-200/80 bg-white py-14">
        <Container className="text-center">
          <h2 className="text-xl font-bold text-navy-900">{labels.bottomTitle}</h2>
          <p className="mt-3 text-sm text-slate-500">{labels.bottomSubtitle}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/contact`}>{labels.bottomContact}</Link>
            </Button>
            <Button variant="ocean" asChild>
              <Link href={`/${locale}/formations`}>{labels.bottomFormations}</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} className="border-slate-200 bg-white" />
    </div>
  );
}
