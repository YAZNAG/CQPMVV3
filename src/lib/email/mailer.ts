import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import type { EmailLogType } from "@prisma/client";

// ─── Transport ────────────────────────────────────────────────────────────────

function createTransport() {
  const port = parseInt(process.env.SMTP_PORT ?? "465");
  const secure = process.env.SMTP_SECURE !== "false";
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "mail.cqpm-nador.ma",
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailLogType;
  applicationId?: string;
  reclamationId?: string;
  contactMessageId?: string;
}

// ─── Core send ────────────────────────────────────────────────────────────────

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  const from = process.env.SMTP_FROM ?? `"CQPM Nador" <no-reply@cqpm-nador.ma>`;

  let success = false;
  let errorMessage: string | undefined;

  try {
    const transport = createTransport();
    await transport.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html });
    success = true;
  } catch (err) {
    errorMessage = String(err);
    console.error(`[email] Failed to send ${opts.type} to ${opts.to}:`, errorMessage);
  }

  // Log always (fire and forget — don't await in calling code)
  try {
    await prisma.emailLog.create({
      data: {
        type: opts.type,
        status: success ? "SENT" : "FAILED",
        recipient: opts.to,
        subject: opts.subject,
        errorMessage: errorMessage ?? null,
        applicationId: opts.applicationId ?? null,
        reclamationId: opts.reclamationId ?? null,
        contactMessageId: opts.contactMessageId ?? null,
      },
    });
  } catch {
    // log write failure is non-fatal
  }

  return success;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://cqpm-nador.ma";

const BRAND_COLOR = "#1a5c8a";
const BRAND_LIGHT = "#e8f4fd";

function emailWrapper(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <tr>
    <td style="background:${BRAND_COLOR};padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">CQPM Nador</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Centre de Qualification Professionnelle Maritime</p>
    </td>
  </tr>
  <tr>
    <td style="padding:32px;">
      ${content}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px;"/>
      <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
        Cet email a été envoyé automatiquement par le système CQPM Nador.<br/>
        Ne pas répondre directement à cet email.
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function badge(text: string, color: string, bg: string): string {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${bg};color:${color};font-size:12px;font-weight:bold;">${text}</span>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#64748b;font-size:13px;width:160px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:500;vertical-align:top;">${value}</td>
  </tr>`;
}

function button(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;margin-top:16px;">${text}</a>`;
}

// ─── Inscription templates ────────────────────────────────────────────────────

interface InscriptionData {
  reference: string;
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  email?: string | null;
  levelName: string;
  filiereName: string;
  candidatProfile: string;
  submittedAt: Date;
  applicationId: string;
  pieces?: string[];
}

function profileLabel(profile: string): string {
  const map: Record<string, string> = {
    COLLEGIEN: "Collégien",
    PROFESSIONNEL: "Professionnel",
    APPRENTISSAGE: "Apprentissage",
  };
  return map[profile] ?? profile;
}

export function buildAdminInscriptionEmail(d: InscriptionData): { subject: string; html: string } {
  const subject = `Nouvelle inscription — Dossier ${d.reference}`;
  const adminUrl = `${BASE_URL}/admin/inscriptions/${d.applicationId}`;
  const date = new Date(d.submittedAt).toLocaleDateString("fr-MA", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;">Nouveau dossier reçu</h2>
    ${badge(d.reference, "#1a5c8a", "#e8f4fd")}
    <p style="margin:16px 0 4px;color:#64748b;font-size:13px;">Déposé le <strong>${date}</strong></p>

    <div style="background:#f8fafc;border-radius:6px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Nom complet", `${d.prenom} ${d.nom}`)}
        ${infoRow("CIN", d.cin)}
        ${infoRow("Téléphone", d.telephone)}
        ${infoRow("Email", d.email ?? "—")}
        ${infoRow("Niveau", d.levelName)}
        ${infoRow("Filière", d.filiereName)}
        ${infoRow("Profil", profileLabel(d.candidatProfile))}
      </table>
    </div>

    ${d.pieces && d.pieces.length > 0 ? `
    <p style="margin:16px 0 8px;font-size:13px;font-weight:bold;color:#1e293b;">Pièces déposées :</p>
    <ul style="margin:0;padding-left:20px;">
      ${d.pieces.map(p => `<li style="font-size:13px;color:#475569;margin:2px 0;">${p}</li>`).join("")}
    </ul>` : ""}

    ${button("Voir le dossier dans le dashboard", adminUrl)}
  `, subject);

  return { subject, html };
}

export function buildCandidateConfirmationEmail(d: InscriptionData): { subject: string; html: string } {
  const subject = `Confirmation de réception — Dossier ${d.reference}`;
  const suiviUrl = `${BASE_URL}/fr/suivi-inscription`;
  const receiptUrl = `${BASE_URL}/api/inscriptions/${d.applicationId}/receipt`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;">Votre dossier a bien été reçu</h2>
    <p style="color:#475569;font-size:14px;margin:0 0 20px;">Bonjour <strong>${d.prenom} ${d.nom}</strong>,</p>
    <p style="color:#475569;font-size:14px;margin:0 0 20px;">
      Votre dossier d'inscription au CQPM Nador a bien été enregistré. Voici un récapitulatif :
    </p>

    <div style="background:${BRAND_LIGHT};border:1px solid #bfdbfe;border-radius:6px;padding:16px;margin:0 0 20px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Code de votre dossier</p>
      <p style="margin:0;font-size:22px;font-weight:bold;color:${BRAND_COLOR};letter-spacing:2px;">${d.reference}</p>
    </div>

    <div style="background:#f8fafc;border-radius:6px;padding:16px;margin:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Niveau", d.levelName)}
        ${infoRow("Filière", d.filiereName)}
        ${infoRow("Statut", "En attente d'étude")}
      </table>
    </div>

    <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin:0 0 20px;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        <strong>Important :</strong> Ce reçu ne constitue pas une acceptation définitive. Votre dossier sera étudié par l'administration et vous serez notifié par email.
      </p>
    </div>

    <p style="font-size:13px;color:#475569;margin:0 0 8px;">
      Pour suivre l'état de votre dossier, utilisez votre <strong>code dossier</strong> et votre <strong>CIN</strong> sur notre page de suivi :
    </p>

    ${button("Suivre mon dossier", suiviUrl)}
    &nbsp;
    <a href="${receiptUrl}" style="display:inline-block;padding:12px 24px;background:#f1f5f9;color:#1e293b;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;margin-top:16px;">Télécharger le reçu</a>
  `, subject);

  return { subject, html };
}

interface StatusEmailData {
  reference: string;
  nom: string;
  prenom: string;
  status: string;
  note?: string | null;
  motifRefus?: string | null;
  levelName?: string;
  filiereName?: string;
  applicationId: string;
}

export function buildStatusChangeEmail(d: StatusEmailData): { subject: string; html: string } {
  const suiviUrl = `${BASE_URL}/fr/suivi-inscription`;

  const configs: Record<string, { subject: string; title: string; color: string; bg: string; body: string }> = {
    IN_REVIEW: {
      subject: `Votre dossier est en cours d'étude — ${d.reference}`,
      title: "Dossier en cours d'étude",
      color: "#1d4ed8",
      bg: "#dbeafe",
      body: `<p style="color:#475569;font-size:14px;">Votre dossier d'inscription est actuellement en cours d'étude par l'équipe administrative du CQPM Nador.</p>
             <p style="color:#475569;font-size:14px;">Vous serez notifié par email dès qu'une décision sera prise. Vous pouvez suivre l'état en temps réel via le lien de suivi.</p>`,
    },
    INCOMPLETE: {
      subject: `Dossier incomplet — ${d.reference}`,
      title: "Dossier incomplet",
      color: "#c2410c",
      bg: "#ffedd5",
      body: `<p style="color:#475569;font-size:14px;">Votre dossier nécessite un complément de pièces ou d'informations.</p>
             ${d.note ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin:16px 0;">
               <p style="margin:0;font-size:13px;color:#92400e;"><strong>Message de l'administration :</strong><br/>${d.note}</p>
             </div>` : ""}
             <p style="color:#475569;font-size:14px;">Veuillez contacter le centre pour plus d'informations.</p>`,
    },
    ACCEPTED: {
      subject: `Inscription acceptée — ${d.reference}`,
      title: "Inscription acceptée",
      color: "#166534",
      bg: "#dcfce7",
      body: `<p style="color:#475569;font-size:14px;">Félicitations ! Votre dossier d'inscription au CQPM Nador a été <strong>accepté</strong>.</p>
             <div style="background:#f0fdf4;border-radius:6px;padding:16px;margin:16px 0;">
               <table width="100%" cellpadding="0" cellspacing="0">
                 ${d.levelName ? infoRow("Niveau", d.levelName) : ""}
                 ${d.filiereName ? infoRow("Filière", d.filiereName) : ""}
                 ${infoRow("Date de décision", new Date().toLocaleDateString("fr-MA", { day: "2-digit", month: "long", year: "numeric" }))}
               </table>
             </div>
             ${d.note ? `<p style="color:#475569;font-size:14px;"><strong>Message :</strong> ${d.note}</p>` : ""}
             <p style="color:#475569;font-size:14px;">L'administration du centre vous contactera prochainement pour les étapes suivantes.</p>`,
    },
    REJECTED: {
      subject: `Inscription refusée — ${d.reference}`,
      title: "Inscription refusée",
      color: "#991b1b",
      bg: "#fee2e2",
      body: `<p style="color:#475569;font-size:14px;">Nous avons le regret de vous informer que votre dossier d'inscription n'a pas été retenu.</p>
             ${d.motifRefus ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px 16px;margin:16px 0;">
               <p style="margin:0;font-size:13px;color:#991b1b;"><strong>Motif :</strong><br/>${d.motifRefus}</p>
             </div>` : ""}
             ${d.note && d.note !== d.motifRefus ? `<p style="color:#475569;font-size:14px;"><strong>Message :</strong> ${d.note}</p>` : ""}
             <p style="color:#475569;font-size:14px;font-size:12px;">Date de décision : ${new Date().toLocaleDateString("fr-MA", { day: "2-digit", month: "long", year: "numeric" })}</p>`,
    },
  };

  const cfg = configs[d.status];
  if (!cfg) return { subject: `Mise à jour dossier — ${d.reference}`, html: "" };

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;">${cfg.title}</h2>
    ${badge(d.reference, cfg.color, cfg.bg)}
    <p style="color:#475569;font-size:14px;margin:16px 0 0;">Bonjour <strong>${d.prenom} ${d.nom}</strong>,</p>
    <div style="margin:16px 0;">${cfg.body}</div>
    ${button("Suivre mon dossier", suiviUrl)}
  `, cfg.subject);

  return { subject: cfg.subject, html };
}

// ─── Contact templates ────────────────────────────────────────────────────────

export function buildContactAdminEmail(opts: {
  name: string;
  email: string;
  subject: string;
  fields: Array<{ label: string; value: string }>;
  messageId: string;
}): { subject: string; html: string } {
  const subject = `[Contact] ${opts.subject}`;
  const adminUrl = `${BASE_URL}/admin/contact`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;">Nouveau message de contact</h2>
    <div style="background:#f8fafc;border-radius:6px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${opts.fields.map(f => infoRow(f.label, f.value || "—")).join("")}
      </table>
    </div>
    ${button("Voir dans le dashboard", adminUrl)}
  `, subject);

  return { subject, html };
}

export function buildContactAckEmail(opts: {
  name: string;
  subject: string;
}): { subject: string; html: string } {
  const subject = `Accusé de réception — ${opts.subject}`;
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;">Message bien reçu</h2>
    <p style="color:#475569;font-size:14px;">Bonjour <strong>${opts.name}</strong>,</p>
    <p style="color:#475569;font-size:14px;">
      Nous avons bien reçu votre message <em>"${opts.subject}"</em> et nous vous répondrons dans les meilleurs délais.
    </p>
    <p style="color:#475569;font-size:14px;">
      Pour toute urgence, vous pouvez nous contacter directement à l'adresse :
      <a href="mailto:contact@cqpm-nador.ma" style="color:${BRAND_COLOR};">contact@cqpm-nador.ma</a>
    </p>
  `, subject);
  return { subject, html };
}

// ─── Réclamation templates ────────────────────────────────────────────────────

export function buildReclamationAdminEmail(opts: {
  reference: string;
  name: string;
  email: string;
  subject: string;
  description: string;
  type: string;
  reclamationId: string;
}): { subject: string; html: string } {
  const subject = `Nouvelle réclamation — ${opts.reference}`;
  const adminUrl = `${BASE_URL}/admin/reclamations`;
  const typeMap: Record<string, string> = {
    ADMINISTRATIVE: "Administrative",
    PEDAGOGICAL: "Pédagogique",
    INFRASTRUCTURE: "Infrastructure",
    OTHER: "Autre",
  };

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;">Nouvelle réclamation reçue</h2>
    ${badge(opts.reference, "#7c3aed", "#ede9fe")}
    <div style="background:#f8fafc;border-radius:6px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Demandeur", opts.name)}
        ${infoRow("Email", opts.email)}
        ${infoRow("Type", typeMap[opts.type] ?? opts.type)}
        ${infoRow("Objet", opts.subject)}
      </table>
    </div>
    <p style="font-size:13px;font-weight:bold;color:#1e293b;margin:0 0 8px;">Description :</p>
    <div style="background:#f8fafc;border-radius:6px;padding:12px 16px;margin:0 0 20px;">
      <p style="margin:0;font-size:13px;color:#475569;">${opts.description.replace(/\n/g, "<br/>")}</p>
    </div>
    ${button("Voir dans le dashboard", adminUrl)}
  `, subject);

  return { subject, html };
}

export function buildReclamationAckEmail(opts: {
  reference: string;
  name: string;
  subject: string;
}): { subject: string; html: string } {
  const subject = `Accusé de réception — Réclamation ${opts.reference}`;
  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:18px;">Réclamation enregistrée</h2>
    <p style="color:#475569;font-size:14px;">Bonjour <strong>${opts.name}</strong>,</p>
    <p style="color:#475569;font-size:14px;">
      Votre réclamation concernant <em>"${opts.subject}"</em> a bien été enregistrée.
    </p>
    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:6px;padding:16px;text-align:center;margin:20px 0;">
      <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Numéro de votre réclamation</p>
      <p style="margin:0;font-size:22px;font-weight:bold;color:#7c3aed;letter-spacing:2px;">${opts.reference}</p>
    </div>
    <p style="color:#475569;font-size:14px;">
      Conservez ce numéro pour suivre l'état de votre réclamation. Vous serez notifié par email lors de chaque mise à jour.
    </p>
    <p style="color:#475569;font-size:14px;">
      Pour nous contacter : <a href="mailto:reclamations@cqpm-nador.ma" style="color:#7c3aed;">reclamations@cqpm-nador.ma</a>
    </p>
  `, subject);
  return { subject, html };
}
