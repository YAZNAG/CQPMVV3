"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApplicationStatus } from "@prisma/client";
import { Check, X, Clock, ListOrdered } from "lucide-react";
import { reviewApplication } from "@/actions/admin/admission.actions";
import { ApplicationStatusBadge } from "./application-status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin/admin-panel";

interface ApplicationReviewPanelProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  currentNote: string | null;
  canWrite: boolean;
}

const actions: {
  status: ApplicationStatus;
  label: string;
  icon: typeof Check;
  variant: "default" | "ocean" | "outline" | "destructive";
  className?: string;
}[] = [
  {
    status: "ACCEPTED",
    label: "Accepter",
    icon: Check,
    variant: "ocean",
    className: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    status: "WAITING_LIST",
    label: "Liste d'attente",
    icon: ListOrdered,
    variant: "outline",
    className: "border-sky-300 text-sky-700 hover:bg-sky-50",
  },
  {
    status: "REJECTED",
    label: "Refuser",
    icon: X,
    variant: "outline",
    className: "border-red-300 text-red-700 hover:bg-red-50",
  },
  {
    status: "PENDING",
    label: "Remettre en attente",
    icon: Clock,
    variant: "outline",
  },
];

export function ApplicationReviewPanel({
  applicationId,
  currentStatus,
  currentNote,
  canWrite,
}: ApplicationReviewPanelProps) {
  const router = useRouter();
  const [note, setNote] = useState(currentNote ?? "");
  const [sendEmail, setSendEmail] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleReview = (status: ApplicationStatus) => {
    startTransition(async () => {
      const result = await reviewApplication({
        id: applicationId,
        status,
        statusNote: note.trim() || undefined,
        sendEmail,
      });
      if (result.success) {
        toast.success("Décision enregistrée");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erreur");
      }
    });
  };

  return (
    <AdminCard>
      <AdminCardHeader>
        <AdminCardTitle className="text-lg">Décision</AdminCardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          Statut actuel : <ApplicationStatusBadge status={currentStatus} />
        </div>
      </AdminCardHeader>
      <AdminCardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="statusNote">Note interne / message au candidat (optionnel)</Label>
          <Textarea
            id="statusNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Motif, compléments demandés, instructions..."
            disabled={!canWrite || isPending}
          />
          <p className="text-xs text-slate-500">
            Inclus dans l&apos;email de notification si l&apos;option ci-dessous est activée.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            disabled={!canWrite || isPending}
            className="rounded border-slate-300"
          />
          Envoyer un email au candidat
        </label>

        {canWrite ? (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              const isCurrent = currentStatus === action.status;
              return (
                <Button
                  key={action.status}
                  type="button"
                  variant={action.variant}
                  className={action.className}
                  disabled={isPending || isCurrent}
                  onClick={() => handleReview(action.status)}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-amber-700">Vous n&apos;avez pas les droits de modification.</p>
        )}
      </AdminCardContent>
    </AdminCard>
  );
}
