import { jsPDF } from "jspdf";

const PRINT_BODY_CLASS = "admission-receipt-printing";

const NAVY: [number, number, number] = [10, 25, 41];
const SLATE: [number, number, number] = [100, 116, 139];
const SLATE_LIGHT: [number, number, number] = [148, 163, 184];
const SKY: [number, number, number] = [56, 189, 248];
const ORANGE: [number, number, number] = [249, 115, 22];

export interface AdmissionReceiptPdfData {
  filename: string;
  siteName: string;
  siteDescription: string;
  siteAddress: string;
  sitePhone: string;
  siteEmail: string;
  rightsLabel: string;
  receiptTitle: string;
  successTitle: string;
  successMessage: string;
  dossierDetails: string;
  dossierNumberLabel: string;
  depositDateLabel: string;
  candidateNameLabel: string;
  formationLabel: string;
  categoryLabel: string;
  statusLabel: string;
  statusValue: string;
  reference: string;
  depositDateValue: string;
  candidateName: string;
  formationTitle: string;
  categoryName: string;
}

export function printAdmissionReceipt() {
  document.body.classList.add(PRINT_BODY_CLASS);
  window.print();
  window.addEventListener(
    "afterprint",
    () => {
      document.body.classList.remove(PRINT_BODY_CLASS);
    },
    { once: true }
  );
}

function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  colWidth: number,
  mono = false
) {
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_LIGHT);
  doc.text(label.toUpperCase(), x, y);

  doc.setFontSize(mono ? 10 : 11);
  doc.setFont("helvetica", mono ? "bold" : "normal");
  doc.setTextColor(...NAVY);
  const lines = doc.splitTextToSize(value || "—", colWidth);
  doc.text(lines, x, y + 5);
  return y + 5 + lines.length * 5;
}

export function downloadAdmissionReceiptPdf(data: AdmissionReceiptPdfData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.siteName.toUpperCase(), margin, 14);

  doc.setFontSize(16);
  doc.text(data.receiptTitle, margin, 24);

  y = 42;
  doc.setTextColor(...NAVY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  const descLines = doc.splitTextToSize(data.siteDescription, contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 4.5 + 6;

  doc.setDrawColor(...SKY);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(data.successTitle, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  const msgLines = doc.splitTextToSize(data.successMessage, contentWidth - 10);
  doc.text(msgLines, pageWidth / 2, y, { align: "center" });
  y += msgLines.length * 4.5 + 10;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const boxTop = y;
  const boxHeight = 88;
  doc.roundedRect(margin, boxTop, contentWidth, boxHeight, 3, 3, "FD");

  doc.setFillColor(...SKY);
  doc.rect(margin, boxTop, contentWidth, 1.2, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(data.dossierDetails, margin + 5, boxTop + 10);

  const col1X = margin + 5;
  const col2X = margin + contentWidth / 2 + 2;
  const colWidth = contentWidth / 2 - 8;
  let rowY = boxTop + 18;

  const row1Bottom = Math.max(
    drawLabelValue(doc, data.dossierNumberLabel, data.reference, col1X, rowY, colWidth, true),
    drawLabelValue(doc, data.depositDateLabel, data.depositDateValue, col2X, rowY, colWidth)
  );
  rowY = row1Bottom + 6;

  const row2Bottom = Math.max(
    drawLabelValue(doc, data.candidateNameLabel, data.candidateName, col1X, rowY, colWidth),
    drawLabelValue(doc, data.formationLabel, data.formationTitle, col2X, rowY, colWidth)
  );
  rowY = row2Bottom + 6;

  drawLabelValue(doc, data.categoryLabel, data.categoryName, col1X, rowY, colWidth);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_LIGHT);
  doc.text(data.statusLabel.toUpperCase(), col2X, rowY);

  doc.setFillColor(255, 237, 213);
  doc.roundedRect(col2X, rowY + 1.5, 28, 7, 2, 2, "F");
  doc.setFillColor(...ORANGE);
  doc.circle(col2X + 3, rowY + 5, 1, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ORANGE);
  doc.text(data.statusValue, col2X + 6, rowY + 5.5);

  y = boxTop + boxHeight + 12;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  if (data.siteAddress) {
    doc.text(data.siteAddress, pageWidth / 2, y, { align: "center" });
    y += 5;
  }
  const contact = [data.sitePhone, data.siteEmail].filter(Boolean).join(" · ");
  if (contact) {
    doc.text(contact, pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  doc.setFontSize(8);
  doc.setTextColor(...SLATE_LIGHT);
  doc.text(
    `© ${new Date().getFullYear()} ${data.siteName}. ${data.rightsLabel}.`,
    pageWidth / 2,
    y + 4,
    { align: "center" }
  );

  doc.save(data.filename);
}
