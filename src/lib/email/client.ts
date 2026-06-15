import { Resend } from "resend";

let resend: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export function getFromEmail(): string {
  return process.env.FROM_EMAIL ?? "noreply@cqpm-nador.ma";
}

export function getAdminEmail(): string | null {
  return process.env.CONTACT_EMAIL ?? null;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
