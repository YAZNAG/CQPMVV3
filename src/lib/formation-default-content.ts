const QUALIFICATION_REQUIREMENTS = {
  fr: `Filières : Pêche maritime • Machine (mécanique navale)
Pour les collégiens : Avoir accompli la 9ème année de l'enseignement secondaire collégial • Être âgé de 18 à 30 ans au 31 décembre de l'année du concours
Pour les professionnels : Être titulaire du diplôme de spécialisation professionnelle maritime • Justifier d'au moins 12 mois de navigation maritime à bord de navires de pêche
Dossier de candidature : Demande manuscrite adressée à la direction du centre • Copie de la Carte Nationale d'Identité (CNI) • Certificat de scolarité extrait du système MASSAR ou visé par la délégation provinciale (collégiens) • Deux enveloppes timbrées portant le nom et l'adresse du candidat • Deux photos récentes avec nom et prénom inscrits au dos • Copie du diplôme de spécialisation certifiée conforme (professionnels) • Relevé de navigation récent de moins de trois mois (professionnels)`,
  ar: `الشعب : الصيد البحري • الميكانيك (الميكانيك البحري)
للتلاميذ : إتمام السنة التاسعة من التعليم الثانوي الإعدادي • العمر بين 18 و30 سنة في 31 دجنبر من سنة المباراة
للمهنيين : الحصول على شهادة التخصص المهني البحري • إثبات 12 شهراً على الأقل من الإبحار على متن سفن الصيد
ملف الترشح : طلب بخط اليد موجه لإدارة المركز • نسخة من البطاقة الوطنية • شهادة مدرسية من نظام مسار أو مصادق عليها (تلاميذ) • ظرفان مهرسان باسم المرشح وعنوانه • صورتان حديثتان مع الاسم في الخلف • نسخة مصادق عليها من شهادة التخصص (مهنيون) • كشف إبحار حديث أقل من ثلاثة أشهر (مهنيون)`,
} as const;

const SPECIALISATION_REQUIREMENTS = {
  fr: `Diplôme préparé : Diplôme de spécialisation professionnelle en Machine et pêche maritime
Conditions d'accès (Pêche et Machine) : Âge minimum de 18 ans • Niveau scolaire : 6ème année primaire ou certificat d'alphabétisation fonctionnelle homologué • Aptitude médicale délivrée par la médecine maritime
Expérience en mer : Minimum de 18 mois d'embarcation (navigation maritime)
Dossier de candidature : Demande manuscrite (nom, adresse, téléphone, email et filière Pêche ou Machine) • Copie de la CNI • Deux photos d'identité récentes • Relevé de navigation actualisé (moins de 3 mois) • Copie du certificat scolaire ou d'alphabétisation • Contrat de formation signé et visé par la délégation des pêches maritimes • Certificat médical délivré par un médecin de la médecine des gens de mer`,
  ar: `الشهادة المعدّة : شهادة التخصص المهني في الميكانيك والصيد البحري
شروط الولوج (الصيد والميكانيك) : 18 سنة كحد أدنى • المستوى الدراسي : السنة السادسة ابتدائي أو شهادة محو الأمية الوظيفية • لياقة طبية من الطب البحري
الخبرة البحرية : 18 شهراً على الأقل من الإبحار
ملف الترشح : طلب بخط اليد (الاسم، العنوان، الهاتف، البريد والشعبة) • نسخة البطاقة الوطنية • صورتان للتعريف • كشف إبحار حديث (أقل من 3 أشهر) • نسخة الشهادة الدراسية • عقد تكوين موقع ومصادق عليه • شهادة طبية من طب البحارة`,
} as const;

export const FORMATION_CATEGORIES = {
  qualification: {
    slug: "qualification",
    nameFr: "Qualification",
    nameAr: "التأهيل",
    descriptionFr:
      "Au titre du niveau Qualification, le CQPM Nador propose deux filières fondamentales : Pêche maritime et Machine (mécanique navale).",
    descriptionAr:
      "في إطار مستوى التأهيل، يقدم المركز شعبتين أساسيتين : الصيد البحري والميكانيك (الميكانيك البحري).",
  },
  specialisation: {
    slug: "specialisation",
    nameFr: "Spécialisation",
    nameAr: "التخصص",
    descriptionFr:
      "Niveau Spécialisation par Apprentissage — préparation au diplôme de spécialisation professionnelle en Machine et pêche maritime.",
    descriptionAr:
      "مستوى التخصص عن طريق التدريب — التحضير للحصول على شهادة التخصص المهني في الميكانيك والصيد البحري.",
  },
} as const;

export const FORMATIONS = [
  {
    slug: "qualification-peche-maritime",
    category: "qualification" as const,
    navLabelFr: "Qualification — Pêche maritime",
    navLabelAr: "التأهيل — الصيد البحري",
    titleFr: "Filière Pêche maritime — Niveau Qualification",
    titleAr: "شعبة الصيد البحري — مستوى التأهيل",
    descriptionFr:
      "Formation de qualification professionnelle maritime en filière Pêche maritime, organisée sous la tutelle du Département de la Pêche Maritime.",
    descriptionAr:
      "تكوين التأهيل المهني البحري في شعبة الصيد البحري، تحت إشراف مديرية الصيد البحري.",
    objectivesFr:
      "• Maîtriser les fondamentaux de la pêche maritime professionnelle\n• Appliquer les règles de sécurité et de survie en mer\n• Préparer l'insertion dans le secteur halieutique",
    objectivesAr:
      "• إتقان أساسيات الصيد البحري المهني\n• تطبيق قواعد السلامة والنجاة في البحر\n• التحضير للإدماج في القطاع الصيدي",
    durationFr: "Formation initiale — Niveau Qualification",
    durationAr: "تكوين أولي — مستوى التأهيل",
    requirementsFr: QUALIFICATION_REQUIREMENTS.fr,
    requirementsAr: QUALIFICATION_REQUIREMENTS.ar,
    order: 0,
  },
  {
    slug: "qualification-machine-maritime",
    category: "qualification" as const,
    navLabelFr: "Qualification — Machine",
    navLabelAr: "التأهيل — الميكانيك",
    titleFr: "Filière Machine — Niveau Qualification",
    titleAr: "شعبة الميكانيك — مستوى التأهيل",
    descriptionFr:
      "Formation de qualification professionnelle maritime en filière Machine (mécanique navale), organisée sous la tutelle du Département de la Pêche Maritime.",
    descriptionAr:
      "تكوين التأهيل المهني البحري في شعبة الميكانيك (الميكانيك البحري)، تحت إشراف مديرية الصيد البحري.",
    objectivesFr:
      "• Maîtriser les systèmes propulsifs et auxiliaires\n• Entretenir les équipements mécaniques de bord\n• Appliquer les procédures de sécurité machine",
    objectivesAr:
      "• إتقان أنظمة الدفع والملحقات\n• صيانة المعدات الميكانيكية على السفينة\n• تطبيق إجراءات سلامة الآلات",
    durationFr: "Formation initiale — Niveau Qualification",
    durationAr: "تكوين أولي — مستوى التأهيل",
    requirementsFr: QUALIFICATION_REQUIREMENTS.fr,
    requirementsAr: QUALIFICATION_REQUIREMENTS.ar,
    order: 1,
  },
  {
    slug: "specialisation-peche-maritime",
    category: "specialisation" as const,
    navLabelFr: "Spécialisation — Pêche maritime",
    navLabelAr: "التخصص — الصيد البحري",
    titleFr: "Filière Pêche maritime — Spécialisation par Apprentissage",
    titleAr: "شعبة الصيد البحري — تخصص عن طريق التدريب",
    descriptionFr:
      "Parcours de spécialisation par apprentissage en filière Pêche maritime, préparant au diplôme de spécialisation professionnelle.",
    descriptionAr:
      "مسار تخصص عن طريق التدريب في شعبة الصيد البحري، يؤهل للحصول على شهادة التخصص المهني.",
    objectivesFr:
      "• Obtenir le diplôme de spécialisation professionnelle\n• Renforcer les compétences en navigation et pêche\n• Valider l'expérience en mer requise",
    objectivesAr:
      "• الحصول على شهادة التخصص المهني\n• تعزيز الكفاءات في الملاحة والصيد\n• تثبيت الخبرة البحرية المطلوبة",
    durationFr: "Spécialisation par Apprentissage",
    durationAr: "تخصص عن طريق التدريب",
    requirementsFr: SPECIALISATION_REQUIREMENTS.fr,
    requirementsAr: SPECIALISATION_REQUIREMENTS.ar,
    order: 0,
  },
  {
    slug: "specialisation-machine-maritime",
    category: "specialisation" as const,
    navLabelFr: "Spécialisation — Machine",
    navLabelAr: "التخصص — الميكانيك",
    titleFr: "Filière Machine — Spécialisation par Apprentissage",
    titleAr: "شعبة الميكانيك — تخصص عن طريق التدريب",
    descriptionFr:
      "Parcours de spécialisation par apprentissage en filière Machine, préparant au diplôme de spécialisation professionnelle en mécanique navale.",
    descriptionAr:
      "مسار تخصص عن طريق التدريب في شعبة الميكانيك، يؤهل للحصول على شهادة التخصص المهني في الميكانيك البحري.",
    objectivesFr:
      "• Obtenir le diplôme de spécialisation professionnelle\n• Perfectionner les compétences en mécanique navale\n• Valider l'expérience en mer requise",
    objectivesAr:
      "• الحصول على شهادة التخصص المهني\n• تنمية الكفاءات في الميكانيك البحري\n• تثبيت الخبرة البحرية المطلوبة",
    durationFr: "Spécialisation par Apprentissage",
    durationAr: "تخصص عن طريق التدريب",
    requirementsFr: SPECIALISATION_REQUIREMENTS.fr,
    requirementsAr: SPECIALISATION_REQUIREMENTS.ar,
    order: 1,
  },
] as const;

export const ALLOWED_FORMATION_SLUGS = FORMATIONS.map((f) => f.slug);

export function getFormationNavChildren(locale: "fr" | "ar") {
  return FORMATIONS.map((formation) => ({
    id: `formation-${formation.slug}`,
    href: `/${locale}/formations/${formation.slug}`,
    label: locale === "ar" ? formation.navLabelAr : formation.navLabelFr,
  }));
}

export const REMOVED_FORMATION_SLUGS = [
  "marin-pecheur-initiation",
  "mecanicien-naval-base",
  "chef-mecanicien",
  "patron-peche",
  "secourisme-survie-mer",
  "lutte-incendie-bord",
  "hygiene-securite-aliments",
] as const;
