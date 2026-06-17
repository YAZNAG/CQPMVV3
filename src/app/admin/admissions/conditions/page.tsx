"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminPageShell } from "@/components/admin/layout/admin-page-shell";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, Loader2, GraduationCap } from "lucide-react";
import { updateFormationRequirements } from "@/actions/admin/formations.actions";

type Formation = {
  id: string;
  titleFr: string;
  titleAr: string;
  requirementsFr: string;
  requirementsAr: string;
};

async function fetchFormations(): Promise<Formation[]> {
  const res = await fetch("/api/admin/formations-simple", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

function FormationConditionsCard({ formation }: { formation: Formation }) {
  const [requirementsFr, setRequirementsFr] = useState(formation.requirementsFr);
  const [requirementsAr, setRequirementsAr] = useState(formation.requirementsAr);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateFormationRequirements({
        id: formation.id,
        requirementsFr,
        requirementsAr,
      });
      if (result.success) {
        setSaved(true);
        toast.success(`Conditions de "${formation.titleFr}" mises à jour`);
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(result.error ?? "Erreur lors de la sauvegarde");
      }
    });
  };

  const isDirty =
    requirementsFr !== formation.requirementsFr ||
    requirementsAr !== formation.requirementsAr;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean-50">
          <GraduationCap className="h-4 w-4 text-ocean-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{formation.titleFr}</h3>
          <p className="text-xs text-slate-500 font-arabic">{formation.titleAr}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">Conditions (Français)</Label>
          <Textarea
            value={requirementsFr}
            onChange={(e) => setRequirementsFr(e.target.value)}
            rows={5}
            placeholder="Niveau requis, prérequis, conditions d'accès en français…"
            className="resize-y text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">الشروط (Arabe)</Label>
          <Textarea
            value={requirementsAr}
            onChange={(e) => setRequirementsAr(e.target.value)}
            rows={5}
            dir="rtl"
            placeholder="شروط القبول…"
            className="resize-y text-sm font-arabic"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Affiché sur la page publique de la filière
        </p>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || isPending}
          className="gap-2"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-3.5 w-3.5" />
          ) : null}
          {saved ? "Sauvegardé" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

export default function ConditionsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormations()
      .then(setFormations)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPageShell
      title="Conditions d'accès"
      description="Gérez les conditions d'inscription et prérequis par filière de formation"
      breadcrumbs={[
        { label: "Inscriptions", href: "/admin/admissions" },
        { label: "Conditions d'accès" },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : formations.length === 0 ? (
        <AdminPanel>
          <div className="py-12 text-center text-slate-500">
            <GraduationCap className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p className="text-sm">Aucune filière trouvée.</p>
          </div>
        </AdminPanel>
      ) : (
        <div className="space-y-4">
          {formations.map((f) => (
            <FormationConditionsCard key={f.id} formation={f} />
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
