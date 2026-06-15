"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import {
  markContactMessageRead,
  markAllContactMessagesRead,
  deleteContactMessage,
} from "@/actions/admin/contact.actions";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  formData: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
}

function formatFieldValue(value: unknown) {
  if (value == null) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return String(value);
}

export function ContactInbox({
  messages,
  canWrite,
}: {
  messages: Message[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-4">
      {canWrite && unread > 0 && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const r = await markAllContactMessagesRead();
              if (r.success) {
                toast.success("Tous les messages marqués comme lus");
                router.refresh();
              }
            })
          }
        >
          <MailOpen className="h-4 w-4" />
          Tout marquer comme lu ({unread})
        </Button>
      )}

      {messages.length === 0 ? (
        <AdminPanel>
          <p className="py-8 text-center text-slate-500">
            Aucun message pour le moment.
          </p>
        </AdminPanel>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id}>
              <AdminPanel
                className={
                  !m.isRead ? "border-ocean-300/60 ring-1 ring-ocean-200/50" : ""
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{m.subject}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {m.name} ·{" "}
                      <a
                        href={`mailto:${m.email}`}
                        className="text-ocean-600 hover:underline"
                      >
                        {m.email}
                      </a>
                      {m.phone && ` · ${m.phone}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(m.createdAt, "fr-FR")}
                    </p>
                  </div>
                  {canWrite && (
                    <div className="flex gap-2">
                      {!m.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              const r = await markContactMessageRead(m.id);
                              if (r.success) router.refresh();
                            })
                          }
                        >
                          <Mail className="h-4 w-4" />
                          Lu
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        disabled={isPending}
                        onClick={() => {
                          if (!confirm("Supprimer ce message ?")) return;
                          startTransition(async () => {
                            const r = await deleteContactMessage(m.id);
                            if (r.success) {
                              toast.success("Message supprimé");
                              router.refresh();
                            }
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {m.formData && Object.keys(m.formData).length > 0 ? (
                  <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                    {Object.entries(m.formData).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                      >
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {key}
                        </dt>
                        <dd className="mt-0.5 text-sm text-slate-800">
                          {formatFieldValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                    {m.message}
                  </p>
                )}
              </AdminPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
