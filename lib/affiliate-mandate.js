import { COMPANY_INFO } from '@/lib/invoicing/company.js';

export const MANDATE_VERSION = 'v1.0';
export const MANDATE_CONTEST_PERIOD_DAYS = 15;
export const AFFILIATE_RETRACTATION_DAYS = 14;

export const MANDATE_TEXT = `MANDAT DE FACTURATION

Entre les soussignés :

D'une part, ${COMPANY_INFO.name.toUpperCase()}, ${COMPANY_INFO.legalForm} au capital de ${COMPANY_INFO.capital}, dont le siège social est situé
au ${COMPANY_INFO.address}, ${COMPANY_INFO.postal} ${COMPANY_INFO.city}, immatriculée au RCS ${COMPANY_INFO.rcs},
représentée par son dirigeant, ci-après dénommée « le Mandataire »,

Et d'autre part, vous-même, ci-après dénommé(e) « le Mandant », apporteur d'affaires dans le programme d'affiliation Finarent,

Il a été convenu ce qui suit :

ARTICLE 1 — OBJET DU MANDAT
Le Mandant donne mandat au Mandataire pour établir, en ses lieu et place, les factures
correspondant aux commissions d'affiliation qui lui sont dues, conformément aux
dispositions de l'article 289-I-2 du Code Général des Impôts.

ARTICLE 2 — IDENTIFICATION DES FACTURES
Chaque facture émise dans le cadre du présent mandat comportera la mention
"Auto-facturation" ainsi que le numéro et la date de signature du présent mandat.

ARTICLE 3 — DROIT DE CONTESTATION
Le Mandant dispose d'un délai de ${MANDATE_CONTEST_PERIOD_DAYS} jours à compter de la
réception de chaque facture pour la contester, par écrit, auprès du Mandataire.

ARTICLE 4 — OBLIGATIONS FISCALES
Le Mandant reste seul responsable de la déclaration et du paiement des taxes afférentes
aux sommes versées par le Mandataire.

ARTICLE 5 — DURÉE — RÉSILIATION
Le présent mandat est conclu pour une durée indéterminée. Chacune des parties peut y
mettre fin à tout moment, par écrit.

ARTICLE 6 — VERSION DU MANDAT
Le présent mandat est en version ${MANDATE_VERSION}.

En cochant la case d'acceptation, le Mandant déclare avoir lu, compris et accepté
l'intégralité des termes du présent mandat.`;
