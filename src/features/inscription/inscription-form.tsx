"use client";

import { useState, useTransition, useEffect } from "react";
import {
  CheckCircle, ChevronRight, ChevronLeft, Upload, FileText, User,
  GraduationCap, ClipboardList, Loader2, X, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { submitInscriptionApplication } from "@/actions/public/inscription.actions";
import type { Locale } from "@/types";

type Level = {
  id: string;
  nameFr: string;
  nameAr: string;
  filieres: { id: string; nameFr: string; nameAr: string }[];
};

type OpenYear = { id: string; year: number } | null;

type DbPiece = { id: string; nameFr: string; nameAr?: string | null; required: boolean };
type DbCondition = { id: string; nameFr: string };

type Props = {
  locale: Locale;
  openYear: OpenYear;
  levels: Level[];
};

// Static fallbacks (shown when DB has no configuration for the selected profile)
const STATIC_CONDITIONS: Record<string, string[]> = {
  COLLEGIEN: [
    "Avoir accompli la 9ème année de l'enseignement secondaire collégial",
    "Être âgé de 18 à 30 ans au 31 décembre de l'année du concours",
  ],
  PROFESSIONNEL: [
    "Être titulaire du diplôme de spécialisation professionnelle maritime",
    "Justifier d'au moins 12 mois de navigation maritime à bord de navires de pêche",
  ],
  APPRENTISSAGE: [
    "Avoir un âge minimum de 18 ans",
    "Justifier d'un niveau scolaire de 6ème année primaire ou d'un certificat d'alphabétisation fonctionnelle homologué",
    "Disposer d'une aptitude médicale délivrée par la médecine maritime",
    "Justifier d'un minimum de 18 mois d'embarquement",
  ],
};

const STATIC_PIECES: Record<string, { nameFr: string; required: boolean }[]> = {
  COLLEGIEN: [
    { nameFr: "Demande manuscrite adressée à la direction du centre", required: true },
    { nameFr: "Copie de la Carte Nationale d'Identité", required: true },
    { nameFr: "Certificat de scolarité MASSAR ou visé par la délégation provinciale", required: true },
    { nameFr: "Deux enveloppes timbrées portant le nom et l'adresse du candidat", required: true },
    { nameFr: "Deux photos récentes", required: true },
  ],
  PROFESSIONNEL: [
    { nameFr: "Demande manuscrite adressée à la direction du centre", required: true },
    { nameFr: "Copie de la Carte Nationale d'Identité", required: true },
    { nameFr: "Copie du diplôme de spécialisation professionnelle maritime certifiée conforme", required: true },
    { nameFr: "Relevé de navigation récent de moins de trois mois", required: true },
    { nameFr: "Deux photos récentes", required: true },
  ],
  APPRENTISSAGE: [
    { nameFr: "Demande manuscrite précisant nom, adresse, téléphone, email et filière choisie", required: true },
    { nameFr: "Copie de la Carte Nationale d'Identité", required: true },
    { nameFr: "Deux photos d'identité récentes", required: true },
    { nameFr: "Relevé de navigation actualisé de moins de trois mois", required: true },
    { nameFr: "Copie du certificat scolaire ou d'alphabétisation fonctionnelle", required: true },
    { nameFr: "Contrat de formation signé et visé par la délégation des pêches maritimes", required: true },
    { nameFr: "Certificat médical délivré par un médecin de la médecine des gens de mer", required: true },
  ],
};

const PROFILES = [
  { value: "COLLEGIEN", labelFr: "Collégien", labelAr: "تلميذ" },
  { value: "PROFESSIONNEL", labelFr: "Professionnel", labelAr: "مهني" },
  { value: "APPRENTISSAGE", labelFr: "Apprentissage", labelAr: "تمرس" },
];

const STEPS = [
  { id: 1, labelFr: "Formation", icon: GraduationCap },
  { id: 2, labelFr: "Informations", icon: User },
  { id: 3, labelFr: "Documents", icon: Upload },
  { id: 4, labelFr: "Confirmation", icon: ClipboardList },
];

export function InscriptionFormPage({ locale, openYear, levels }: Props) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);

  // Step 1
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedFiliereId, setSelectedFiliereId] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");

  // Dynamic DB data
  const [dbPieces, setDbPieces] = useState<DbPiece[]>([]);
  const [dbConditions, setDbConditions] = useState<DbCondition[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Step 2
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [cin, setCin] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [niveauScolaire, setNiveauScolaire] = useState("");
  const [niveauxScolaires, setNiveauxScolaires] = useState<{ id: string; nameFr: string; nameAr: string }[]>([]);

  // Step 3
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, File | null>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});

  // Upload progress (post-submit)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadDone, setUploadDone] = useState(false);

  const isRtl = locale === "ar";
  const selectedLevel = levels.find((l) => l.id === selectedLevelId);
  const filieres = selectedLevel?.filieres ?? [];

  // Use DB data when available, fall back to static
  const conditions =
    dbConditions.length > 0
      ? dbConditions.map((c) => c.nameFr)
      : selectedProfile
      ? STATIC_CONDITIONS[selectedProfile] ?? []
      : [];

  const pieces: { id?: string; nameFr: string; required: boolean }[] =
    dbPieces.length > 0
      ? dbPieces
      : selectedProfile
      ? STATIC_PIECES[selectedProfile] ?? []
      : [];

  // Fetch active niveaux scolaires once on mount
  useEffect(() => {
    fetch("/api/inscriptions/niveaux-scolaires")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (Array.isArray(data)) setNiveauxScolaires(data); })
      .catch(() => {});
  }, []);

  // Fetch conditions + pieces from DB when all 3 selections are made
  useEffect(() => {
    if (!selectedLevelId || !selectedFiliereId || !selectedProfile) {
      setDbPieces([]);
      setDbConditions([]);
      return;
    }
    setLoadingConfig(true);
    const params = `levelId=${selectedLevelId}&filiereId=${selectedFiliereId}&candidatProfile=${selectedProfile}`;
    Promise.all([
      fetch(`/api/inscriptions/pieces?${params}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/inscriptions/conditions?${params}`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, c]) => {
        if (Array.isArray(p)) setDbPieces(p);
        if (Array.isArray(c)) setDbConditions(c);
      })
      .catch(() => {})
      .finally(() => setLoadingConfig(false));
  }, [selectedLevelId, selectedFiliereId, selectedProfile]);

  const canGoStep2 = selectedLevelId && selectedFiliereId && selectedProfile;
  const canGoStep3 =
    nom.trim() && prenom.trim() && cin.trim() && dateNaissance && telephone.trim() && adresse.trim() && ville.trim();
  const canGoStep4 = pieces.every((p, i) => !p.required || uploadedFiles[i]);

  const handleFileChange = (index: number, file: File | null) => {
    const errors = { ...uploadErrors };
    if (file) {
      if (file.type !== "application/pdf") {
        errors[index] = "Seuls les fichiers PDF sont acceptés";
        setUploadErrors(errors);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors[index] = "Taille maximale : 5 Mo";
        setUploadErrors(errors);
        return;
      }
      delete errors[index];
    }
    setUploadErrors(errors);
    setUploadedFiles((prev) => ({ ...prev, [index]: file }));
  };

  // Upload files to server after application is created
  const uploadFiles = async (appId: string) => {
    const filesToUpload = Object.entries(uploadedFiles).filter(([, f]) => f !== null);
    const piecesWithIds = pieces.filter((p) => p.id);

    if (filesToUpload.length === 0 || piecesWithIds.length === 0) {
      setUploadDone(true);
      return;
    }

    setUploadProgress({ done: 0, total: filesToUpload.length });

    let done = 0;
    for (const [idxStr, file] of filesToUpload) {
      if (!file) continue;
      const idx = parseInt(idxStr);
      const piece = pieces[idx];
      if (!piece?.id) {
        done++;
        setUploadProgress({ done, total: filesToUpload.length });
        continue;
      }
      try {
        const form = new FormData();
        form.append("applicationId", appId);
        form.append("pieceId", piece.id);
        form.append("file", file);
        await fetch("/api/inscriptions/upload", { method: "POST", body: form });
      } catch {
        // non-fatal — candidate can bring physical copies
      }
      done++;
      setUploadProgress({ done, total: filesToUpload.length });
    }
    setUploadDone(true);
  };

  const handleSubmit = () => {
    if (!openYear) return;
    startTransition(async () => {
      const result = await submitInscriptionApplication({
        yearId: openYear.id,
        levelId: selectedLevelId,
        filiereId: selectedFiliereId,
        candidatProfile: selectedProfile as "COLLEGIEN" | "PROFESSIONNEL" | "APPRENTISSAGE",
        nom,
        prenom,
        cin,
        dateNaissance,
        telephone,
        email: email || undefined,
        adresse,
        ville,
        niveauScolaire: niveauScolaire || undefined,
      });

      if (result.success && result.reference) {
        setSubmittedRef(result.reference);
        setApplicationId(result.applicationId ?? null);
        toast.success("Dossier déposé avec succès !");
        // Upload files in background (non-blocking for UX)
        if (result.applicationId) {
          uploadFiles(result.applicationId);
        } else {
          setUploadDone(true);
        }
      } else {
        toast.error(result.error ?? "Erreur lors du dépôt");
      }
    });
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submittedRef) {
    const hasFiles = Object.values(uploadedFiles).some((f) => f !== null);
    const showUploadProgress = hasFiles && dbPieces.length > 0 && !uploadDone;

    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-white py-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Dossier déposé avec succès !</h1>
          <p className="mb-6 text-slate-600">Votre dossier d&apos;inscription a bien été enregistré.</p>
          <div className="rounded-2xl border border-ocean-200 bg-white p-8 shadow-sm">
            <p className="mb-1 text-sm text-slate-500">Votre code dossier</p>
            <p className="mb-4 text-3xl font-bold tracking-wider text-ocean-700">{submittedRef}</p>
            <p className="text-sm text-slate-500">
              Conservez ce code pour suivre l&apos;avancement de votre dossier.
            </p>
          </div>

          {showUploadProgress && uploadProgress && (
            <div className="mt-4 rounded-xl border border-ocean-100 bg-ocean-50 px-4 py-3 text-sm text-ocean-800">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Envoi des pièces jointes… ({uploadProgress.done}/{uploadProgress.total})
            </div>
          )}
          {uploadDone && hasFiles && dbPieces.length > 0 && (
            <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
              <CheckCircle className="mr-2 inline h-4 w-4" />
              Pièces jointes envoyées.
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {applicationId && (
              <a
                href={`/api/inscriptions/${applicationId}/receipt`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-ocean-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ocean-700"
              >
                <FileText className="h-4 w-4" />
                Télécharger le reçu
              </a>
            )}
            <a
              href={`/${locale}/suivi-inscription`}
              className="inline-flex items-center gap-2 rounded-lg border border-ocean-200 bg-white px-5 py-2.5 text-sm font-semibold text-ocean-700 hover:bg-ocean-50"
            >
              Suivre mon dossier
            </a>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Ce dossier ne constitue pas une acceptation définitive. Vous serez contacté par le centre.
          </p>
        </div>
      </div>
    );
  }

  // ── Closed screen ──────────────────────────────────────────────────────────
  if (!openYear) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h1 className="mb-2 text-xl font-bold text-slate-900">Inscriptions fermées</h1>
          <p className="text-slate-600">
            Les inscriptions ne sont pas ouvertes actuellement. Veuillez revenir ultérieurement ou contacter le centre.
          </p>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div
      className={cn("min-h-screen bg-gradient-to-b from-slate-50 to-white", isRtl && "font-arabic")}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Hero */}
      <div className="bg-[#0c1929] py-10 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="mb-1 text-sm font-medium uppercase tracking-widest text-ocean-300">
            CQPM Nador — {openYear.year}
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">Inscription en ligne</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Stepper */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                      isDone
                        ? "border-green-500 bg-green-500 text-white"
                        : isActive
                        ? "border-ocean-600 bg-ocean-600 text-white"
                        : "border-slate-300 bg-white text-slate-400",
                    )}
                  >
                    {isDone ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={cn(
                      "mt-1 hidden text-xs font-medium sm:block",
                      isActive ? "text-ocean-600" : "text-slate-400",
                    )}
                  >
                    {s.labelFr}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("mx-1 h-0.5 flex-1 sm:mx-2", isDone ? "bg-green-400" : "bg-slate-200")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 — Formation */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Choix de la formation</h2>

            <div>
              <Label className="mb-2 block text-sm font-medium">Niveau demandé *</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {levels.map((lv) => (
                  <button
                    key={lv.id}
                    type="button"
                    onClick={() => {
                      setSelectedLevelId(lv.id);
                      setSelectedFiliereId("");
                      setSelectedProfile("");
                    }}
                    className={cn(
                      "rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                      selectedLevelId === lv.id
                        ? "border-ocean-500 bg-ocean-50 text-ocean-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-ocean-300",
                    )}
                  >
                    <span className="font-semibold">{lv.nameFr}</span>
                    {lv.nameAr && <span className="mt-0.5 block text-xs text-slate-500">{lv.nameAr}</span>}
                  </button>
                ))}
              </div>
            </div>

            {filieres.length > 0 && (
              <div>
                <Label className="mb-2 block text-sm font-medium">Filière demandée *</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {filieres.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setSelectedFiliereId(f.id);
                        setSelectedProfile("");
                      }}
                      className={cn(
                        "rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                        selectedFiliereId === f.id
                          ? "border-ocean-500 bg-ocean-50 text-ocean-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-ocean-300",
                      )}
                    >
                      {f.nameFr}
                      {f.nameAr && <span className="mt-0.5 block text-xs text-slate-500">{f.nameAr}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedFiliereId && (
              <div>
                <Label className="mb-2 block text-sm font-medium">Profil candidat *</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PROFILES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setSelectedProfile(p.value)}
                      className={cn(
                        "rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition-all",
                        selectedProfile === p.value
                          ? "border-ocean-500 bg-ocean-50 text-ocean-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-ocean-300",
                      )}
                    >
                      {p.labelFr}
                      <span className="mt-0.5 block text-xs text-slate-500">{p.labelAr}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingConfig && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement des conditions…
              </div>
            )}

            {conditions.length > 0 && !loadingConfig && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-amber-800">Conditions d&apos;accès</h3>
                <ul className="space-y-2">
                  {conditions.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canGoStep2} className="gap-2">
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Informations */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Informations personnelles</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nom" className="mb-1.5 block text-sm">
                  Nom *
                </Label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="NOM"
                  className="uppercase"
                />
              </div>
              <div>
                <Label htmlFor="prenom" className="mb-1.5 block text-sm">
                  Prénom *
                </Label>
                <Input
                  id="prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <Label htmlFor="cin" className="mb-1.5 block text-sm">
                  CIN *
                </Label>
                <Input
                  id="cin"
                  value={cin}
                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                  placeholder="AB123456"
                />
              </div>
              <div>
                <Label htmlFor="dateNaissance" className="mb-1.5 block text-sm">
                  Date de naissance *
                </Label>
                <Input
                  id="dateNaissance"
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="telephone" className="mb-1.5 block text-sm">
                  Téléphone *
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="0600000000"
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1.5 block text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@example.com"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="adresse" className="mb-1.5 block text-sm">
                  Adresse *
                </Label>
                <Input
                  id="adresse"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Adresse complète"
                />
              </div>
              <div>
                <Label htmlFor="ville" className="mb-1.5 block text-sm">
                  Ville *
                </Label>
                <Input
                  id="ville"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="Nador"
                />
              </div>
              <div>
                <Label htmlFor="niveauScolaire" className="mb-1.5 block text-sm">
                  Niveau scolaire
                </Label>
                <select
                  id="niveauScolaire"
                  value={niveauScolaire}
                  onChange={(e) => setNiveauScolaire(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ocean-500"
                >
                  <option value="">-- Choisir --</option>
                  {niveauxScolaires.map((ns) => (
                    <option key={ns.id} value={ns.nameFr}>{locale === "ar" ? ns.nameAr : ns.nameFr}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Retour
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canGoStep3} className="gap-2">
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Documents */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Pièces à joindre</h2>
            <p className="text-sm text-slate-500">
              Formats acceptés : PDF uniquement — Taille max : 5 Mo par fichier
            </p>
            {pieces.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Aucune pièce requise pour ce profil. Passez à l&apos;étape suivante.
              </div>
            ) : (
              <div className="space-y-3">
                {pieces.map((piece, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="text-sm font-medium text-slate-800">{piece.nameFr}</span>
                      </div>
                      {piece.required && (
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">
                          Obligatoire
                        </span>
                      )}
                    </div>
                    {uploadedFiles[i] ? (
                      <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                        <span className="truncate text-xs text-green-800">{uploadedFiles[i]!.name}</span>
                        <button
                          type="button"
                          onClick={() => handleFileChange(i, null)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-3 py-2.5 text-xs text-slate-500 hover:border-ocean-300 hover:bg-ocean-50">
                        <Upload className="h-4 w-4" />
                        Choisir un fichier PDF
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="sr-only"
                          onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )}
                    {uploadErrors[i] && <p className="mt-1 text-xs text-red-600">{uploadErrors[i]}</p>}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Retour
              </Button>
              <Button onClick={() => setStep(4)} disabled={!canGoStep4} className="gap-2">
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Confirmation du dossier</h2>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Formation choisie
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p>
                    <span className="text-slate-500">Niveau :</span>{" "}
                    <span className="font-medium">{selectedLevel?.nameFr}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Filière :</span>{" "}
                    <span className="font-medium">
                      {filieres.find((f) => f.id === selectedFiliereId)?.nameFr}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">Profil :</span>{" "}
                    <span className="font-medium">
                      {PROFILES.find((p) => p.value === selectedProfile)?.labelFr}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Informations personnelles
                </h3>
                <div className="grid gap-1.5 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-slate-500">Nom :</span>{" "}
                    <span className="font-medium">
                      {nom} {prenom}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-500">CIN :</span>{" "}
                    <span className="font-medium">{cin}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Téléphone :</span>{" "}
                    <span className="font-medium">{telephone}</span>
                  </p>
                  {email && (
                    <p>
                      <span className="text-slate-500">Email :</span>{" "}
                      <span className="font-medium">{email}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-slate-500">Ville :</span>{" "}
                    <span className="font-medium">{ville}</span>
                  </p>
                </div>
              </div>

              {pieces.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pièces jointes
                  </h3>
                  <ul className="space-y-1">
                    {pieces.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        {uploadedFiles[i] ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-slate-300" />
                        )}
                        <span className={uploadedFiles[i] ? "text-slate-800" : "text-slate-400"}>
                          {p.nameFr}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={conditionsAccepted}
                onChange={(e) => setConditionsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-ocean-600"
              />
              <span className="text-sm text-slate-700">
                Je certifie l&apos;exactitude des informations fournies et j&apos;accepte que mon dossier soit étudié
                par le CQPM Nador. Je comprends que ce dépôt ne constitue pas une acceptation définitive.
              </span>
            </label>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Retour
              </Button>
              <Button onClick={handleSubmit} disabled={!conditionsAccepted || isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Déposer mon dossier
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
