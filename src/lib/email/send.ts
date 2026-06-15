import type { ApplicationStatus } from "@prisma/client";
import {
  adminNewApplicationEmail,
  applicationReceivedEmail,
  applicationStatusChangedEmail,
} from "./templates";
import { getAdminEmail, getFromEmail, getResendClient, getSiteUrl } from "./client";

async function sendEmail(params: {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  try {
    await resend.emails.send({
      from: getFromEmail(),
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error("[email] send failed:", error);
    return false;
  }
}

export async function notifyApplicationReceived(params: {
  email: string;
  firstName: string;
  referenceNumber: string;
  formationTitle: string;
}) {
  const tpl = applicationReceivedEmail(params);
  return sendEmail({ to: params.email, ...tpl });
}

export async function notifyApplicationStatusChanged(params: {
  email: string;
  firstName: string;
  referenceNumber: string;
  formationTitle: string;
  status: ApplicationStatus;
  statusNote?: string | null;
}) {
  const tpl = applicationStatusChangedEmail(params);
  return sendEmail({ to: params.email, ...tpl });
}

export async function notifyAdminNewApplication(params: {
  applicationId: string;
  referenceNumber: string;
  applicantName: string;
  cin: string;
  formationTitle: string;
}) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) return false;

  const adminUrl = `${getSiteUrl()}/admin/admissions/${params.applicationId}`;
  const tpl = adminNewApplicationEmail({ ...params, adminUrl });
  return sendEmail({ to: adminEmail, ...tpl });
}
