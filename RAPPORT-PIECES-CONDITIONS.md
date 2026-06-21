# Rapport — Vérification et sécurisation du paramétrage Pièces / Conditions d'inscription CQPM Nador

Date : 21/06/2026

## 1. Sources officielles consultées

- `Niveau Spécialisation par Apprentissage.docx`
- `niveau qualification et filiere.docx`

Ces deux documents définissent les niveaux, filières, conditions d'accès et pièces de dossier officielles du centre.

## 2. Comparaison documents officiels ↔ base de données

### Niveaux et filières

| Document officiel | Base de données (`inscription_levels` / `inscription_filieres`) | Statut |
|---|---|---|
| Niveau Qualification → filières Pêche maritime, Machine | `Qualification` → `Pêche maritime`, `Machine` | ✅ Conforme |
| Niveau Spécialisation par Apprentissage → filières Pêche, Machine | `Spécialisation par Apprentissage` → `Pêche maritime`, `Machine` | ✅ Conforme |

### Conditions d'accès (`inscription_conditions`)

| Niveau | Profil | Condition (document officiel) | En base |
|---|---|---|---|
| Qualification | Collégien | 9ème année secondaire collégial | ✅ |
| Qualification | Collégien | Âgé de 18 à 30 ans au 31/12 de l'année du concours | ✅ |
| Qualification | Professionnel | Titulaire du diplôme de spécialisation professionnelle maritime | ✅ |
| Qualification | Professionnel | 12 mois de navigation maritime minimum | ✅ |
| Spécialisation Apprentissage | Apprentissage | Âge minimum 18 ans | ✅ |
| Spécialisation Apprentissage | Apprentissage | Niveau scolaire 6ème primaire OU certificat alphabétisation | ✅ |
| Spécialisation Apprentissage | Apprentissage | Aptitude médicale délivrée par la médecine maritime | ✅ |
| Spécialisation Apprentissage | Apprentissage | Minimum 18 mois d'embarquement | ✅ |

**8/8 conditions conformes**, partagées entre les deux filières d'un même niveau (le document officiel ne différencie pas les conditions par filière).

### Pièces demandées (`inscription_pieces`)

| Niveau | Profil | Pièce (document officiel) | En base |
|---|---|---|---|
| Qualification | Les deux | Demande manuscrite | ✅ |
| Qualification | Les deux | Copie CNI | ✅ |
| Qualification | Collégien | Certificat scolarité MASSAR / visé délégation | ✅ |
| Qualification | Collégien | 2 enveloppes timbrées | ✅ |
| Qualification | Les deux | 2 photos récentes | ✅ |
| Qualification | Professionnel | Copie diplôme spécialisation certifiée conforme | ✅ |
| Qualification | Professionnel | Relevé de navigation < 3 mois | ✅ |
| Apprentissage | Apprentissage | Demande manuscrite (nom, adresse, tél, email, filière) | ✅ |
| Apprentissage | Apprentissage | Copie CNI | ✅ |
| Apprentissage | Apprentissage | 2 photos d'identité récentes | ✅ |
| Apprentissage | Apprentissage | Relevé de navigation actualisé < 3 mois | ✅ |
| Apprentissage | Apprentissage | Copie certificat scolaire / alphabétisation | ✅ |
| Apprentissage | Apprentissage | Contrat de formation signé/visé délégation pêches | ✅ |
| Apprentissage | Apprentissage | Certificat médical (médecine des gens de mer) | ✅ |

**17/17 pièces conformes**, toutes marquées obligatoires (`isRequired = true`), partagées entre les deux filières d'un même niveau (`filiereId = NULL`), exactement comme spécifié dans les documents (aucune pièce n'est propre à une filière donnée).

## 3. Correction apportée au formulaire public

**Problème identifié et corrigé** (session précédente, confirmé ici comme correct au regard des documents officiels) : le formulaire `/fr/inscription` proposait le profil **"Apprentissage"** même quand le candidat choisissait le niveau **"Qualification"**. Cette combinaison n'existe dans aucun des deux documents officiels — elle ne renvoie aucune pièce ni condition paramétrée, laissant le candidat déposer un dossier vide de pièces.

**Correctif** (`src/features/inscription/inscription-form.tsx`) : le profil affiché dépend désormais strictement du niveau choisi :
- Niveau **Qualification** → Collégien / Professionnel uniquement
- Niveau **Spécialisation par Apprentissage** → Apprentissage uniquement

Ce correctif garantit que toute nouvelle inscription correspond systématiquement à une combinaison niveau/profil réellement paramétrée dans le dashboard, donc avec des pièces et conditions affichées.

## 4. Gestion dans le dashboard admin

| Fonction | Page | État |
|---|---|---|
| Paramétrer les pièces demandées (nom FR/AR, niveau, filière, profil, obligatoire, taille max, statut) | `/admin/inscriptions/pieces` | ✅ Opérationnel, CRUD complet |
| Paramétrer les conditions d'accès (texte FR/AR, niveau, filière, profil, ordre, statut) | `/admin/inscriptions/conditions` | ✅ Opérationnel, CRUD complet |
| Voir les pièces requises vs déposées par dossier | `/admin/inscriptions/[id]` (onglet Pièces) | ✅ Tableau croisé Requis/Reçu/Manquant |

## 5. Sécurité des documents joints — vérifiée

| Contrôle | Implémentation | Fichier |
|---|---|---|
| Stockage hors `/public` | `storage/candidats/{CODE_DOSSIER}/`, chemin défini par `CANDIDAT_STORAGE_DIR` | `src/lib/storage/candidat-storage.ts` |
| Aucun accès direct par URL | Le `storedName` est un nom de fichier opaque (UUID), jamais exposé en chemin public | `src/app/api/inscriptions/upload/route.ts` |
| Authentification obligatoire | `auth()` — retourne 401 si pas de session | `src/app/api/admin/inscriptions/documents/[documentId]/route.ts` |
| Vérification du rôle | `hasPermission(role, "admissions", "read")` — retourne 403 si rôle insuffisant | idem + `download-zip/route.ts` |
| Journalisation des accès | Chaque téléchargement crée une ligne `audit_logs` (action `DOWNLOAD`, utilisateur, document, IP, user-agent) | les deux routes ci-dessus |
| Téléchargement groupé sécurisé | `/api/admin/inscriptions/[id]/download-zip` — même contrôle session + rôle + audit | `download-zip/route.ts` |

**Aucune faille détectée** : un utilisateur non connecté ou sans le rôle `ADMIN`/`SUPER_ADMIN` ne peut ni consulter ni télécharger une pièce, ni individuellement ni en ZIP.

## 6. État final

- Paramétrage pièces et conditions : **conforme à 100 %** aux deux documents officiels fournis
- Formulaire public : **corrigé** pour n'autoriser que les combinaisons niveau/profil réellement configurées
- Dashboard admin : pages de gestion pièces/conditions opérationnelles, page détail dossier affiche le statut Reçu/Manquant par pièce
- Sécurité documents : **vérifiée conforme** — accès strictement réservé aux administrateurs connectés, avec journal d'audit

## 7. Recommandation

Aucune anomalie de paramétrage résiduelle n'a été détectée. Le seul point d'attention concerne les dossiers déjà créés **avant** le correctif de filtrage de profil (ex. `CQPM-2026-000016`, créé en combinaison invalide Qualification + Apprentissage) : ces dossiers historiques nécessitent une correction manuelle au cas par cas depuis le dashboard (changement de niveau ou marquage "Dossier incomplet").
