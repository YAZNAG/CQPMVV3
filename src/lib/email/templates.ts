import type { ApplicationStatus } from "@prisma/client";

const STATUS_FR: Record<ApplicationStatus, string> = {
  PENDING: "En attente d'examen",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  WAITING_LIST: "Liste d'attente",
};

export function applicationReceivedEmail(params: {
  firstName: string;
  referenceNumber: string;
  formationTitle: string;
}) {
  const subject = `[CQPM] Candidature reçue — ${params.referenceNumber}`;
  const text = `Bonjour ${params.firstName},

Votre candidature pour la formation « ${params.formationTitle} » a bien été enregistrée.

Numéro de référence : ${params.referenceNumber}

Vous pouvez suivre l'état de votre dossier sur notre site (section Inscriptions > Suivi de candidature) avec votre numéro CIN.

Cordialement,
CQPM Nador`;

  const html = `
<p>Bonjour <strong>${escapeHtml(params.firstName)}</strong>,</p>
<p>Votre candidature pour la formation <strong>${escapeHtml(params.formationTitle)}</strong> a bien été enregistrée.</p>
<p><strong>Référence :</strong> <code>${escapeHtml(params.referenceNumber)}</code></p>
<p>Suivez votre dossier sur le site CQPM (Inscriptions → Suivi de candidature) avec votre CIN.</p>
<p>Cordialement,<br/>CQPM Nador</p>`;

  return { subject, text, html };
}

export function applicationStatusChangedEmail(params: {
  firstName: string;
  referenceNumber: string;
  formationTitle: string;
  status: ApplicationStatus;
  statusNote?: string | null;
}) {
  const statusLabel = STATUS_FR[params.status];
  const subject = `[CQPM] Mise à jour candidature — ${statusLabel}`;
  const noteBlock = params.statusNote
    ? `\n\nMessage du centre :\n${params.statusNote}`
    : "";

  const text = `Bonjour ${params.firstName},

Le statut de votre candidature (${params.referenceNumber}) pour « ${params.formationTitle} » a été mis à jour :

Statut : ${statusLabel}${noteBlock}

Cordialement,
CQPM Nador`;

  const noteHtml = params.statusNote
    ? `<p><strong>Message du centre :</strong><br/>${escapeHtml(params.statusNote)}</p>`
    : "";

  const html = `
<p>Bonjour <strong>${escapeHtml(params.firstName)}</strong>,</p>
<p>Votre candidature <code>${escapeHtml(params.referenceNumber)}</code> pour <strong>${escapeHtml(params.formationTitle)}</strong> a été mise à jour.</p>
<p><strong>Nouveau statut :</strong> ${escapeHtml(statusLabel)}</p>
${noteHtml}
<p>Cordialement,<br/>CQPM Nador</p>`;

  return { subject, text, html };
}

export function adminNewApplicationEmail(params: {
  referenceNumber: string;
  applicantName: string;
  cin: string;
  formationTitle: string;
  adminUrl: string;
}) {
  const subject = `[CQPM Admin] Nouvelle candidature — ${params.referenceNumber}`;
  const text = `Nouvelle candidature reçue.

Référence : ${params.referenceNumber}
Candidat : ${params.applicantName}
CIN : ${params.cin}
Formation : ${params.formationTitle}

Consulter : ${params.adminUrl}`;

  const html = `
<p><strong>Nouvelle candidature</strong></p>
<ul>
  <li>Référence : <code>${escapeHtml(params.referenceNumber)}</code></li>
  <li>Candidat : ${escapeHtml(params.applicantName)}</li>
  <li>CIN : ${escapeHtml(params.cin)}</li>
  <li>Formation : ${escapeHtml(params.formationTitle)}</li>
</ul>
<p><a href="${escapeHtml(params.adminUrl)}">Ouvrir dans l'administration</a></p>`;

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
