import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const app = await prisma.inscriptionApplication.findFirst({
    where: { id, deletedAt: null },
    include: {
      level: { select: { nameFr: true } },
      filiere: { select: { nameFr: true } },
      year: { select: { year: true } },
      documents: {
        where: { deletedAt: null },
        include: { piece: { select: { nameFr: true } } },
      },
    },
  });

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const submittedDate = new Date(app.submittedAt).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const profileLabel = { COLLEGIEN: "Collégien", PROFESSIONNEL: "Professionnel", APPRENTISSAGE: "Apprentissage" }[app.candidatProfile] ?? app.candidatProfile;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu d'inscription — ${app.reference}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1e293b; background: white; }
    .page { max-width: 700px; margin: 0 auto; padding: 40px 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #0c4a6e; margin-bottom: 24px; }
    .header-left h1 { font-size: 20px; font-weight: 700; color: #0c1929; }
    .header-left p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .header-right { text-align: right; }
    .ref-badge { display: inline-block; background: #0c1929; color: white; padding: 6px 14px; border-radius: 6px; font-size: 15px; font-weight: 700; letter-spacing: 1px; font-family: monospace; }
    .status-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-top: 6px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
    .field { display: flex; flex-direction: column; }
    .field-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { font-size: 13px; font-weight: 500; color: #1e293b; }
    .doc-list { list-style: none; }
    .doc-list li { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
    .doc-list li::before { content: "✓"; color: #22c55e; font-weight: 700; }
    .footer-note { margin-top: 32px; padding: 12px 16px; background: #fef9ee; border: 1px solid #fde68a; border-radius: 8px; font-size: 11px; color: #78350f; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
    @media print {
      .no-print { display: none; }
      body { font-size: 12px; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="no-print" style="margin-bottom:20px; text-align: right;">
    <button onclick="window.print()" style="background:#0c1929;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;">
      🖨️ Imprimer / Enregistrer en PDF
    </button>
  </div>

  <div class="header">
    <div class="header-left">
      <h1>Centre de Qualification Professionnelle Maritime</h1>
      <p>CQPM Nador — Reçu d'inscription en ligne</p>
    </div>
    <div class="header-right">
      <div class="ref-badge">${app.reference}</div>
      <br>
      <span class="status-badge">EN ATTENTE</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Informations du candidat</div>
    <div class="grid">
      <div class="field"><span class="field-label">Nom complet</span><span class="field-value">${app.prenom} ${app.nom}</span></div>
      <div class="field"><span class="field-label">CIN</span><span class="field-value">${app.cin}</span></div>
      <div class="field"><span class="field-label">Date de naissance</span><span class="field-value">${new Date(app.dateNaissance).toLocaleDateString("fr-FR")}</span></div>
      <div class="field"><span class="field-label">Téléphone</span><span class="field-value">${app.telephone}</span></div>
      ${app.email ? `<div class="field"><span class="field-label">Email</span><span class="field-value">${app.email}</span></div>` : ""}
      <div class="field"><span class="field-label">Ville</span><span class="field-value">${app.ville}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Formation demandée</div>
    <div class="grid">
      <div class="field"><span class="field-label">Niveau</span><span class="field-value">${app.level.nameFr}</span></div>
      <div class="field"><span class="field-label">Filière</span><span class="field-value">${app.filiere.nameFr}</span></div>
      <div class="field"><span class="field-label">Profil</span><span class="field-value">${profileLabel}</span></div>
      <div class="field"><span class="field-label">Année concours</span><span class="field-value">${app.year.year}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Pièces déposées (${app.documents.length})</div>
    ${app.documents.length > 0
      ? `<ul class="doc-list">${app.documents.map((d: { piece: { nameFr: string } }) => `<li>${d.piece.nameFr}</li>`).join("")}</ul>`
      : `<p style="color:#94a3b8;font-size:12px;">Aucune pièce déposée en ligne</p>`
    }
  </div>

  <div class="footer-note">
    ⚠️ Ce reçu ne constitue pas une acceptation définitive. Votre dossier sera étudié par l'administration du centre. Date de dépôt : ${submittedDate}
  </div>

  <div class="footer">
    <span>CQPM Nador — Nador, Maroc</span>
    <span>Généré le ${new Date().toLocaleDateString("fr-FR")}</span>
  </div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
