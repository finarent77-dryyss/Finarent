'use client';

import Link from 'next/link';
import PageTransition from '@/components/animations/PageTransition';
import ScrollReveal from '@/components/animations/ScrollReveal';

const LAST_UPDATED = '18 mai 2026';

const SECTIONS = [
  {
    id: 'responsable',
    title: '1. Responsable du traitement',
    body: (
      <>
        <p>
          Le responsable du traitement des données collectées sur le site finarent.fr est la
          société <strong>Finarent</strong>, courtier en financement et assurance professionnelle.
        </p>
        <ul className="list-disc pl-6 mt-3 space-y-1">
          <li>Adresse postale : 39 Avenue de la République, 77340 Pontault-Combault — SAS immatriculée au RCS de Melun sous le n° 931 295 836</li>
          <li>Email : <a className="text-secondary underline" href="mailto:dpo@finarent.fr">dpo@finarent.fr</a></li>
          <li>Téléphone : disponible sur la page <Link href="/contact" className="text-secondary underline">contact</Link></li>
          <li>Inscription ORIAS (IOBSP + IAS) : numéro publié dès activité commerciale</li>
        </ul>
      </>
    ),
  },
  {
    id: 'donnees-collectees',
    title: '2. Données personnelles collectées',
    body: (
      <>
        <p>Nous collectons strictement les données nécessaires à l'exécution de notre mission de courtage :</p>
        <ul className="list-disc pl-6 mt-3 space-y-1">
          <li><strong>Identification</strong> : nom, prénom, email, téléphone, statut juridique</li>
          <li><strong>Données entreprise</strong> : raison sociale, SIREN/SIRET, secteur d'activité, forme juridique</li>
          <li><strong>Données financières</strong> : montant souhaité, durée, bilans transmis volontairement, RIB/IBAN si pertinent</li>
          <li><strong>Documents justificatifs</strong> : KBIS, pièce d'identité du dirigeant, bilans, RIB (téléversés par vous)</li>
          <li><strong>Données de navigation</strong> : adresse IP, type de navigateur, pages consultées (cookies essentiels uniquement par défaut)</li>
          <li><strong>Données de signature</strong> : adresse IP, user agent et horodatage lors d'une signature électronique (preuve d'engagement)</li>
        </ul>
      </>
    ),
  },
  {
    id: 'finalites',
    title: '3. Finalités et bases légales',
    body: (
      <>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Exécution d'un contrat</strong> (art. 6.1.b RGPD) — montage de votre dossier et consultation de partenaires bancaires/assurantiels</li>
          <li><strong>Obligation légale</strong> (art. 6.1.c) — lutte contre le blanchiment (LCB-FT), conservation comptable et fiscale, devoir de conseil DDA</li>
          <li><strong>Intérêt légitime</strong> (art. 6.1.f) — sécurité du site, prévention de la fraude, amélioration des services</li>
          <li><strong>Consentement</strong> (art. 6.1.a) — newsletter, cookies analytics et marketing (révocable à tout moment via le bandeau cookies)</li>
        </ul>
      </>
    ),
  },
  {
    id: 'destinataires',
    title: '4. Destinataires des données',
    body: (
      <>
        <p>Vos données ne sont transmises qu'aux destinataires strictement nécessaires :</p>
        <ul className="list-disc pl-6 mt-3 space-y-1">
          <li>Équipes Finarent autorisées (courtiers, gestionnaires, conformité)</li>
          <li>Partenaires bancaires et assurantiels pour lesquels vous nous donnez mandat (consentement explicite avant chaque transmission)</li>
          <li>Sous-traitants techniques : hébergeur (Vercel / Neon), stockage documents (Supabase), authentification (Auth0), emailing (SMTP), signature électronique (YouSign) — tous liés par contrat conforme RGPD</li>
          <li>Autorités publiques sur réquisition (ACPR, TRACFIN, justice)</li>
        </ul>
        <p className="mt-3">Aucune donnée n'est vendue, louée ou échangée à des fins commerciales.</p>
      </>
    ),
  },
  {
    id: 'duree',
    title: '5. Durée de conservation',
    body: (
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Dossier actif</strong> : pendant toute la durée de la relation commerciale</li>
        <li><strong>Dossier inactif (prospect non converti)</strong> : 3 ans à compter du dernier contact</li>
        <li><strong>Dossier signé / contrat</strong> : 5 ans à compter de la fin du contrat (art. L. 110-4 Code de commerce) puis archivage 10 ans (obligations comptables)</li>
        <li><strong>Données LCB-FT</strong> : 5 ans après la fin de la relation (Code monétaire et financier)</li>
        <li><strong>Documents supprimés par l'utilisateur</strong> : conservés 30 jours en suppression logique puis purgés définitivement</li>
        <li><strong>Logs techniques et audit</strong> : 12 mois</li>
        <li><strong>Cookies</strong> : 13 mois maximum (recommandation CNIL)</li>
      </ul>
    ),
  },
  {
    id: 'securite',
    title: '6. Sécurité des données',
    body: (
      <>
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles strictes :</p>
        <ul className="list-disc pl-6 mt-3 space-y-1">
          <li><strong>Chiffrement AES-256-GCM</strong> au repos pour les champs sensibles (RIB, IBAN, conditions financières, signatures manuscrites, notes confidentielles)</li>
          <li><strong>HTTPS / TLS</strong> sur l'ensemble du site et des API</li>
          <li><strong>Authentification</strong> Auth0 avec mots de passe hashés, MFA disponible</li>
          <li><strong>Contrôle d'accès</strong> par rôle (client / admin / partenaire / assureur) avec audit trail de chaque consultation de document</li>
          <li><strong>Hébergement</strong> en Union Européenne (Vercel EU / Neon EU / Supabase EU)</li>
          <li><strong>Sauvegardes</strong> chiffrées et redondées</li>
        </ul>
      </>
    ),
  },
  {
    id: 'droits',
    title: '7. Vos droits',
    body: (
      <>
        <p>Conformément aux articles 15 à 22 du RGPD, vous disposez à tout moment des droits suivants :</p>
        <ul className="list-disc pl-6 mt-3 space-y-1">
          <li><strong>Droit d'accès</strong> — obtenir une copie de vos données (export JSON depuis votre <Link href="/espace/profile" className="text-secondary underline">espace client</Link>)</li>
          <li><strong>Droit de rectification</strong> — corriger une donnée inexacte (formulaire dans l'espace client)</li>
          <li><strong>Droit à l'effacement</strong> — supprimer votre compte (anonymisation immédiate, suppression définitive sous 30 jours sauf obligation légale)</li>
          <li><strong>Droit d'opposition et de limitation</strong> — refuser un traitement non obligatoire (marketing, profilage)</li>
          <li><strong>Droit à la portabilité</strong> — récupérer vos données dans un format structuré et machine-lisible</li>
          <li><strong>Droit de retirer votre consentement</strong> à tout moment pour les traitements basés sur celui-ci (cookies, newsletter)</li>
        </ul>
        <p className="mt-3">
          Pour exercer ces droits, écrivez à <a className="text-secondary underline" href="mailto:dpo@finarent.fr">dpo@finarent.fr</a> ou utilisez les outils de votre <Link href="/espace/profile" className="text-secondary underline">espace client</Link>. Réponse sous 1 mois maximum (article 12 RGPD).
        </p>
        <p className="mt-3">
          En cas de litige, vous pouvez introduire une réclamation auprès de la <a className="text-secondary underline" href="https://www.cnil.fr" target="_blank" rel="noopener">CNIL</a>.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '8. Cookies et traceurs',
    body: (
      <>
        <p>Notre site utilise trois catégories de cookies :</p>
        <ul className="list-disc pl-6 mt-3 space-y-1">
          <li><strong>Cookies essentiels</strong> (toujours actifs) — session d'authentification, sécurité, fonctionnement du site. Pas de consentement requis (art. 82 LIL).</li>
          <li><strong>Cookies analytics</strong> (PostHog, désactivés par défaut) — mesure d'audience anonymisée pour améliorer le site. Activés uniquement avec votre consentement explicite.</li>
          <li><strong>Cookies marketing</strong> (désactivés par défaut) — personnalisation des contenus et publicité ciblée. Activés uniquement avec votre consentement explicite.</li>
        </ul>
        <p className="mt-3">
          Vous pouvez modifier vos préférences à tout moment via le bandeau cookies (icône en bas de page) ou en supprimant la valeur <code>finarent_consent</code> de votre navigateur.
        </p>
      </>
    ),
  },
  {
    id: 'modifications',
    title: '9. Modifications de la politique',
    body: (
      <p>
        Cette politique peut être amendée pour rester conforme à la réglementation. La date de dernière mise à jour figure en haut de page. Les modifications substantielles seront signalées par email et/ou bandeau sur le site.
      </p>
    ),
  },
];

export default function PrivacyClient() {
  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-10">
                <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-4">
                  <span className="text-secondary font-semibold text-xs uppercase tracking-widest">RGPD · Données personnelles</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-primary mb-3 tracking-tight">Politique de confidentialité</h1>
                <p className="text-sm text-gray-500">Dernière mise à jour : {LAST_UPDATED}</p>
              </div>

              {/* Sommaire */}
              <nav aria-label="Sommaire" className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-5 mb-8 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Sommaire</h2>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  {SECTIONS.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="text-primary hover:text-secondary transition-colors">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 space-y-10">
                {SECTIONS.map((s) => (
                  <section key={s.id} id={s.id} className="scroll-mt-32">
                    <h2 className="text-2xl font-bold text-primary mb-4">{s.title}</h2>
                    <div className="text-gray-600 leading-relaxed space-y-2">{s.body}</div>
                  </section>
                ))}
              </div>

              <p className="text-center text-xs text-gray-400 mt-8">
                Contact DPO : <a className="underline" href="mailto:dpo@finarent.fr">dpo@finarent.fr</a> · Plainte CNIL : <a className="underline" href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
