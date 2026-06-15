"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminBilingualGrid,
  AdminField,
  AdminFormFooter,
  AdminTextField,
} from "@/components/admin/admin-form-fields";
import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { updateContactPageSettings } from "@/actions/admin/contact-form.actions";

export interface ContactPageSettingsData {
  email: string;
  phone: string;
  addressFr: string;
  addressAr: string;
  contactHoursFr: string;
  contactHoursAr: string;
  contactIntroFr: string;
  contactIntroAr: string;
  contactMapUrl: string;
}

export function ContactPageSettings({
  initial,
  canWrite,
}: {
  initial: ContactPageSettingsData;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;
    startTransition(async () => {
      const result = await updateContactPageSettings({
        ...form,
        email: form.email || null,
        phone: form.phone || null,
        addressFr: form.addressFr || null,
        addressAr: form.addressAr || null,
        contactHoursFr: form.contactHoursFr || null,
        contactHoursAr: form.contactHoursAr || null,
        contactIntroFr: form.contactIntroFr || null,
        contactIntroAr: form.contactIntroAr || null,
        contactMapUrl: form.contactMapUrl || null,
      });
      if (result.success) {
        toast.success("Coordonnées enregistrées");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={MapPin}
        title="Coordonnées & page contact"
        description="Informations affichées à gauche du formulaire et carte Google Maps."
      />
      {canWrite ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField
              label="Email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              type="email"
            />
            <AdminField
              label="Téléphone"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            />
          </div>
          <AdminBilingualGrid>
            <AdminTextField
              label="Adresse (FR)"
              value={form.addressFr}
              onChange={(v) => setForm((f) => ({ ...f, addressFr: v }))}
              rows={2}
            />
            <AdminTextField
              label="Adresse (AR)"
              value={form.addressAr}
              onChange={(v) => setForm((f) => ({ ...f, addressAr: v }))}
              dir="rtl"
              rows={2}
            />
            <AdminField
              label="Horaires (FR)"
              value={form.contactHoursFr}
              onChange={(v) => setForm((f) => ({ ...f, contactHoursFr: v }))}
              placeholder="Lundi — Vendredi, 8h30 — 16h30"
            />
            <AdminField
              label="Horaires (AR)"
              value={form.contactHoursAr}
              onChange={(v) => setForm((f) => ({ ...f, contactHoursAr: v }))}
              dir="rtl"
            />
            <AdminTextField
              label="Introduction (FR)"
              value={form.contactIntroFr}
              onChange={(v) => setForm((f) => ({ ...f, contactIntroFr: v }))}
              rows={2}
            />
            <AdminTextField
              label="Introduction (AR)"
              value={form.contactIntroAr}
              onChange={(v) => setForm((f) => ({ ...f, contactIntroAr: v }))}
              dir="rtl"
              rows={2}
            />
          </AdminBilingualGrid>
          <AdminField
            label="URL carte Google Maps (embed)"
            value={form.contactMapUrl}
            onChange={(v) => setForm((f) => ({ ...f, contactMapUrl: v }))}
            placeholder="https://www.google.com/maps/embed?pb=..."
            hint="Laissez vide pour utiliser NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL"
          />
          <div className="flex flex-wrap gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-ocean-600" />
              {form.email || "—"}
            </span>
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-ocean-600" />
              {form.phone || "—"}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-ocean-600" />
              {form.contactHoursFr || "—"}
            </span>
          </div>
          <AdminFormFooter className="mt-0 border-0 pt-0">
            <Button type="submit" variant="ocean" disabled={isPending}>
              Enregistrer les coordonnées
            </Button>
          </AdminFormFooter>
        </form>
      ) : (
        <p className="text-sm text-slate-500">Lecture seule.</p>
      )}
    </AdminPanel>
  );
}
