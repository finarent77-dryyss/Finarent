export const metadata = {
  title: 'Conditions Générales de Vente',
  description: "Conditions Générales de Vente et d'Utilisation du site Finarent — Activités d'intermédiation IOBSP et COA.",
  alternates: { canonical: '/cgv' },
  robots: { index: true, follow: true },
};

const ARTICLES = [
  { id: 'art1',  label: 'Identification du prestataire' },
  { id: 'art2',  label: 'Définitions' },
  { id: 'art3',  label: "Objet et champ d'application" },
  { id: 'art4',  label: 'Description des services' },
  { id: 'art5',  label: 'Processus de souscription et formation du contrat' },
  { id: 'art6',  label: 'Droit de rétractation du Consommateur', badge: 'b2c' },
  { id: 'art7',  label: 'Prix, rémunération et modalités de paiement' },
  { id: 'art8',  label: 'Obligations du Client' },
  { id: 'art9',  label: 'Obligations de Finarent' },
  { id: 'art10', label: 'Responsabilité' },
  { id: 'art11', label: 'Données personnelles et confidentialité' },
  { id: 'art12', label: 'Cookies' },
  { id: 'art13', label: 'Propriété intellectuelle' },
  { id: 'art14', label: 'Lutte contre le blanchiment (LCB-FT)' },
  { id: 'art15', label: 'Durée et résiliation du Mandat' },
  { id: 'art16', label: 'Médiation, réclamations et règlement des litiges' },
  { id: 'art17', label: 'Force majeure' },
  { id: 'art18', label: 'Dispositions générales' },
  { id: 'art19', label: 'Acceptation' },
  { id: 'annexes', label: 'Annexes' },
];

const Badge = ({ kind, children }) => (
  <span className={`inline-block align-middle ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${kind === 'b2c' ? 'bg-orange-500 text-white' : 'bg-primary text-white'}`}>
    {children}
  </span>
);

const Callout = ({ kind = 'info', children }) => {
  const styles = {
    info: 'bg-emerald-50 border-emerald-500 text-emerald-900',
    warn: 'bg-amber-50 border-amber-500 text-amber-900',
    danger: 'bg-rose-50 border-rose-500 text-rose-900',
  };
  return (
    <div className={`my-6 p-4 sm:p-5 border-l-4 rounded-r-lg ${styles[kind]}`}>
      {children}
    </div>
  );
};

const Section = ({ id, n, title, children }) => (
  <section id={id} className="scroll-mt-24 mt-12">
    <h2 className="text-xl sm:text-2xl font-bold text-primary border-b border-gray-200 pb-2 mb-4">
      Article {n} — {title}
    </h2>
    <div className="space-y-3 text-gray-700 leading-relaxed">{children}</div>
  </section>
);

const Sub = ({ children }) => <h3 className="text-base sm:text-lg font-bold text-primary mt-6 mb-2">{children}</h3>;

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Header */}
        <header className="border-b-2 border-emerald-500 pb-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-primary mb-2">Conditions Générales de Vente</h1>
          <div className="text-base text-emerald-700 font-semibold">Finarent — finarrent.vercel.app</div>
          <div className="text-xs text-gray-500 mt-2">
            Version en vigueur au <strong>2026</strong> · Dernière mise à jour : <strong>13 mai 2026</strong>
          </div>
        </header>

        {/* Intro */}
        <p className="text-gray-700 leading-relaxed">
          Les présentes Conditions Générales de Vente et d&apos;Utilisation (ci-après les « <strong>CGV</strong> ») régissent l&apos;ensemble des relations contractuelles entre la société Finarent et toute personne, physique ou morale, professionnelle ou consommateur, faisant appel à ses services d&apos;intermédiation en financement et en assurance, qu&apos;elles soient présentées sur le site internet{' '}
          <a href="https://finarrent.vercel.app" className="text-emerald-700 underline">finarrent.vercel.app</a> ou souscrites par tout autre canal.
        </p>

        <Callout kind="info">
          <strong>Lecture obligatoire avant tout engagement.</strong> Le Client reconnaît avoir pris connaissance des présentes CGV et les avoir acceptées sans réserve préalablement à toute demande de prestation, en cochant la case dédiée lors de la prise de contact en ligne ou par signature préalable.
        </Callout>

        {/* Sommaire */}
        <nav className="my-10 bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-primary mb-3">Sommaire</h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1 columns-1 sm:columns-2">
            {ARTICLES.map((a) => (
              <li key={a.id}>
                <a href={`#${a.id}`} className="text-primary hover:text-emerald-600 hover:underline">
                  {a.label}
                </a>
                {a.badge && <Badge kind={a.badge}>{a.badge.toUpperCase()}</Badge>}
              </li>
            ))}
          </ol>
        </nav>

        {/* Article 1 */}
        <Section id="art1" n="1" title="Identification du prestataire">
          <p>Le présent site internet et les services qui y sont décrits sont édités et exploités par :</p>
          <div className="overflow-x-auto my-4 rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr><th className="text-left p-3 w-1/3">Élément</th><th className="text-left p-3">Information</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="p-3">Dénomination sociale</td><td className="p-3"><strong>FINARENT</strong></td></tr>
                <tr><td className="p-3">Forme juridique</td><td className="p-3">Société par Actions Simplifiée (SAS)</td></tr>
                <tr><td className="p-3">Capital social</td><td className="p-3">10 000 €</td></tr>
                <tr><td className="p-3">Siège social</td><td className="p-3">39 avenue de la République, 77340 Pontault-Combault</td></tr>
                <tr><td className="p-3">RCS</td><td className="p-3 text-gray-400 italic">Melun [À compléter une fois immatriculation effective]</td></tr>
                <tr><td className="p-3">SIRET</td><td className="p-3 text-gray-400 italic">[À compléter]</td></tr>
                <tr><td className="p-3">TVA intracommunautaire</td><td className="p-3 text-gray-400 italic">[À compléter]</td></tr>
                <tr><td className="p-3">Code APE/NAF</td><td className="p-3">6622Z — Activités des agents et courtiers d&apos;assurances</td></tr>
                <tr><td className="p-3">Représentant légal</td><td className="p-3">M. LENS Sébastien Jean-Pierre, Président</td></tr>
                <tr><td className="p-3">Directeur de la publication</td><td className="p-3">M. LENS Sébastien Jean-Pierre</td></tr>
                <tr><td className="p-3">Hébergeur</td><td className="p-3">Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA — <a href="https://vercel.com" className="text-emerald-700 underline">vercel.com</a></td></tr>
              </tbody>
            </table>
          </div>

          <Sub>Immatriculations ORIAS et autorités de contrôle</Sub>
          <p>Finarent exerce des activités d&apos;intermédiation réglementées et est immatriculée au registre unique des intermédiaires (ORIAS) sous les catégories suivantes :</p>
          <div className="overflow-x-auto my-4 rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr><th className="text-left p-3">Catégorie</th><th className="text-left p-3">N° ORIAS</th><th className="text-left p-3">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="p-3">Intermédiaire en Opérations de Banque et en Services de Paiement (IOBSP)</td><td className="p-3 text-gray-400 italic">[À compléter]</td><td className="p-3 text-gray-400 italic">[À compléter]</td></tr>
                <tr><td className="p-3">Courtier d&apos;Assurance (COA)</td><td className="p-3 text-gray-400 italic">[À compléter]</td><td className="p-3 text-gray-400 italic">[À compléter]</td></tr>
              </tbody>
            </table>
          </div>
          <p><strong>Vérification :</strong> Le statut d&apos;intermédiaire peut être vérifié à tout moment sur le site officiel <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">www.orias.fr</a>.</p>
          <p>L&apos;activité d&apos;intermédiation est placée sous le contrôle de l&apos;<strong>Autorité de contrôle prudentiel et de résolution (ACPR)</strong> — 4 Place de Budapest, CS 92459, 75436 Paris Cedex 09 — <a href="https://acpr.banque-france.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">acpr.banque-france.fr</a>.</p>

          <Sub>Garanties professionnelles</Sub>
          <p>Conformément aux articles L.512-7 du Code des assurances et L.519-4 du Code monétaire et financier :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Assurance RC Professionnelle</strong> — couverture minimum 1 500 000 € par sinistre.</li>
            <li><strong>Garantie financière</strong> — montant minimum 115 000 € (IOBSP) + 115 000 € (COA).</li>
          </ul>
        </Section>

        {/* Article 2 */}
        <Section id="art2" n="2" title="Définitions">
          <p>Dans les présentes CGV, les termes suivants ont la signification définie ci-après :</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li><strong>« Finarent »</strong> ou <strong>« le Courtier »</strong> ou <strong>« le Prestataire »</strong> : la société identifiée à l&apos;article 1, agissant en qualité d&apos;intermédiaire au sens des articles L.511-1 du Code des assurances et L.519-1 du Code monétaire et financier.</li>
            <li><strong>« Client »</strong> : toute personne physique (consommateur ou professionnel) ou morale qui sollicite les services de Finarent.</li>
            <li><strong>« Consommateur »</strong> : au sens de l&apos;article liminaire du Code de la consommation, toute personne physique agissant à des fins qui n&apos;entrent pas dans le cadre de son activité professionnelle.</li>
            <li><strong>« Professionnel »</strong> : toute personne physique ou morale agissant à des fins entrant dans le cadre de son activité commerciale, industrielle, artisanale, libérale ou agricole.</li>
            <li><strong>« Services »</strong> : l&apos;ensemble des prestations d&apos;intermédiation, de conseil et d&apos;assistance proposées par Finarent (recherche de financement, crédit-bail, LOA, leasing, crédit professionnel, courtage en assurance, conseil patrimonial).</li>
            <li><strong>« Partenaires »</strong> : les établissements financiers, compagnies d&apos;assurance, sociétés de location auprès desquels Finarent négocie pour le compte de ses Clients.</li>
            <li><strong>« Mandat »</strong> : le contrat de courtage ou de recherche de financement signé entre Finarent et le Client.</li>
            <li><strong>« Site »</strong> : le site internet accessible à l&apos;adresse <code className="bg-gray-100 px-1 rounded text-xs">finarrent.vercel.app</code>.</li>
          </ul>
        </Section>

        {/* Article 3 */}
        <Section id="art3" n="3" title="Objet et champ d'application">
          <p>Les présentes CGV ont pour objet de définir les conditions dans lesquelles Finarent propose et délivre ses Services au Client, tant via le Site qu&apos;en dehors de celui-ci.</p>
          <p>Elles s&apos;appliquent à toute demande de prestation, à toute mise en relation, à tout mandat conclu, et à tout contrat d&apos;intermédiation placé par Finarent, à l&apos;exclusion de toutes autres conditions, notamment celles du Client.</p>
          <p>Finarent se réserve le droit de modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur à la date de conclusion du contrat. Les CGV publiées sur le Site font foi.</p>
        </Section>

        {/* Article 4 */}
        <Section id="art4" n="4" title="Description des services">
          <Sub>4.1 — Intermédiation en opérations de banque (IOBSP)</Sub>
          <p>Au titre de son agrément IOBSP, Finarent propose au Client une mission d&apos;intermédiation portant sur :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>La recherche et la négociation de solutions de crédit-bail mobilier et immobilier ;</li>
            <li>La location avec option d&apos;achat (LOA) et la location longue durée (LLD) à finalité professionnelle ;</li>
            <li>Les solutions de leasing opérationnel et financier ;</li>
            <li>Les crédits professionnels (crédit d&apos;investissement, crédit de trésorerie, prêt) ;</li>
            <li>L&apos;affacturage et la mobilisation de créances ;</li>
            <li>Les solutions de financement de croissance externe.</li>
          </ul>
          <p>Finarent intervient en qualité d&apos;intermédiaire non exclusif. La liste des Partenaires financiers est disponible sur simple demande écrite.</p>

          <Sub>4.2 — Intermédiation en assurance (COA)</Sub>
          <p>Au titre de son agrément COA, Finarent propose un courtage en assurance portant sur :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Responsabilité Civile Professionnelle (RC Pro) ;</li>
            <li>Responsabilité Civile Exploitation ;</li>
            <li>Assurance des locaux professionnels (multirisque pro) ;</li>
            <li>Protection juridique et garantie cyber-risques ;</li>
            <li>Prévoyance et santé collective des dirigeants et salariés ;</li>
            <li>Flotte automobile professionnelle et engins de chantier ;</li>
            <li>Garanties spécifiques (caution, biennale, décennale, RC Décennale BTP).</li>
          </ul>
          <p>Finarent analyse les besoins du Client et lui présente une ou plusieurs offres adaptées issues d&apos;au moins trois compagnies d&apos;assurance partenaires, conformément à l&apos;article L.521-2 du Code des assurances.</p>

          <Sub>4.3 — Conseil et accompagnement</Sub>
          <p>Au-delà de l&apos;intermédiation, Finarent peut proposer des prestations complémentaires de conseil (audit de couverture, optimisation de financement, conseil patrimonial professionnel), facturées séparément selon les conditions de l&apos;article 7.</p>
        </Section>

        {/* Article 5 */}
        <Section id="art5" n="5" title="Processus de souscription et formation du contrat">
          <Sub>5.1 — Demande initiale via le Site</Sub>
          <p>Le Client peut adresser une demande de prestation à Finarent par le formulaire de contact en ligne, par téléphone, par courriel ou par tout autre moyen. La demande initiale ne constitue pas un engagement contractuel.</p>
          <Sub>5.2 — Information précontractuelle</Sub>
          <p>Avant la conclusion de tout Mandat, Finarent remet au Client, conformément aux articles L.521-2 du Code des assurances et L.519-4-1 du Code monétaire et financier, un document d&apos;information précontractuelle comprenant : identité et immatriculations ORIAS ; nature et étendue de la mission ; liens financiers significatifs avec les Partenaires ; mode de rémunération ; coordonnées des médiateurs compétents.</p>
          <Sub>5.3 — Conclusion du Mandat</Sub>
          <p>Le Mandat est conclu par la signature physique ou électronique du Client (au sens du règlement eIDAS et de l&apos;article 1366 du Code civil). Il précise : l&apos;objet de la mission, la durée (généralement 6 à 12 mois), l&apos;exclusivité ou non-exclusivité, la rémunération, les modalités de résiliation.</p>
          <Sub>5.4 — Acceptation des CGV</Sub>
          <p>La conclusion du Mandat emporte acceptation pleine et entière, sans réserve, des présentes CGV par le Client.</p>
        </Section>

        {/* Article 6 */}
        <Section id="art6" n="6" title="Droit de rétractation du Consommateur">
          <Callout kind="warn">
            <strong>Article applicable exclusivement aux Clients ayant la qualité de Consommateur</strong> au sens de l&apos;article liminaire du Code de la consommation. Les Clients Professionnels n&apos;en bénéficient pas, sauf cas spécifique de l&apos;article L.221-3 (Professionnel &lt; 5 salariés agissant hors champ de son activité principale).
          </Callout>
          <Sub>6.1 — Délai de rétractation</Sub>
          <p>Conformément aux articles L.221-18 et suivants du Code de la consommation, le Client Consommateur dispose d&apos;un <strong>délai de quatorze (14) jours calendaires</strong> à compter de la conclusion du Mandat à distance ou hors établissement, pour exercer son droit de rétractation, sans avoir à motiver sa décision ni à supporter d&apos;autres coûts que ceux prévus à l&apos;article L.221-23 et suivants.</p>
          <Sub>6.2 — Modalités d&apos;exercice</Sub>
          <p>Pour exercer son droit de rétractation, le Client Consommateur doit notifier à Finarent sa décision, sans ambiguïté, par lettre recommandée avec accusé de réception adressée au siège social, ou par courriel, avant l&apos;expiration du délai de 14 jours. Le Client peut utiliser le modèle de formulaire de rétractation figurant en annexe.</p>
          <Sub>6.3 — Effets de la rétractation</Sub>
          <p>Finarent rembourse au Client les sommes éventuellement versées, sans retard injustifié et au plus tard dans les <strong>14 jours</strong> suivant la notification, en utilisant le même moyen de paiement que celui utilisé initialement, sauf accord exprès du Client.</p>
          <Sub>6.4 — Cas où le droit de rétractation est perdu</Sub>
          <p>Conformément à l&apos;article L.221-25 du Code de la consommation, si le Client Consommateur souhaite que la prestation commence avant la fin du délai de 14 jours, il doit l&apos;indiquer expressément par écrit. Si la prestation est intégralement exécutée avant la fin du délai, le Consommateur ne pourra plus se rétracter. Si elle est partiellement exécutée, il restera redevable d&apos;un montant proportionnel à ce qui aura été fourni jusqu&apos;à la date de rétractation.</p>
        </Section>

        {/* Article 7 */}
        <Section id="art7" n="7" title="Prix, rémunération et modalités de paiement">
          <Sub>7.1 — Principe général de rémunération</Sub>
          <p>La rémunération de Finarent s&apos;effectue selon l&apos;un des modèles suivants, indiqués au Client avant la conclusion du Mandat :</p>
          <p><strong>a) Rémunération par les Partenaires :</strong> Finarent perçoit une commission directement de l&apos;établissement financier ou de la compagnie d&apos;assurance partenaire en cas de placement effectif du contrat. Le Client ne supporte aucun coût direct.</p>
          <p><strong>b) Honoraires facturés au Client :</strong> Pour certaines missions complexes, Finarent peut facturer des honoraires directement au Client (forfait, temps passé, ou pourcentage du financement obtenu).</p>
          <p><strong>c) Modèle mixte :</strong> Pour certains dossiers, Finarent peut combiner commission Partenaire et honoraires Client.</p>
          <Sub>7.2 — Transparence des commissions</Sub>
          <p>Conformément à l&apos;article L.521-2-III du Code des assurances, le Client peut demander à tout moment et par écrit la communication du montant exact ou de l&apos;estimation des commissions perçues. Finarent s&apos;engage à répondre dans un délai de 15 jours ouvrés.</p>
          <Sub>7.3 — TVA et facturation</Sub>
          <p>Les honoraires sont exprimés hors taxes. La TVA en vigueur en France (20 % à la date de publication) est ajoutée le cas échéant. Les commissions perçues au titre de l&apos;intermédiation en assurance sont exonérées de TVA en application de l&apos;article 261 C-2° du CGI.</p>
          <Sub>7.4 — Modalités de paiement</Sub>
          <p>Les honoraires sont payables par virement bancaire, à 30 jours fin de mois date de facture, sauf stipulation contraire.</p>
          <Sub>7.5 — Retard de paiement</Sub>
          <p><strong>Clients Professionnels<Badge kind="b2b">B2B</Badge> :</strong> tout retard entraîne, de plein droit et sans mise en demeure préalable, l&apos;application de pénalités au taux BCE majoré de 10 points, ainsi qu&apos;une indemnité forfaitaire pour frais de recouvrement de 40 € (article L.441-10 du Code de commerce).</p>
          <p><strong>Clients Consommateurs<Badge kind="b2c">B2C</Badge> :</strong> tout retard entraîne l&apos;application d&apos;intérêts moratoires au taux légal, après mise en demeure restée sans effet pendant 30 jours.</p>
        </Section>

        {/* Article 8 */}
        <Section id="art8" n="8" title="Obligations du Client">
          <p>Le Client s&apos;engage à :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Fournir à Finarent, dans les meilleurs délais, l&apos;ensemble des informations et documents nécessaires (Kbis, statuts, comptes annuels, RIB, bulletins de salaire, avis d&apos;imposition, etc.) ;</li>
            <li>Garantir l&apos;exactitude, la sincérité et l&apos;exhaustivité des informations communiquées (articles L.113-2 et L.113-8 du Code des assurances) ;</li>
            <li>Signaler à Finarent, sans délai, tout changement de situation susceptible d&apos;affecter la mission ;</li>
            <li>Régler dans les délais convenus les éventuels honoraires de Finarent et les primes/loyers afférents aux contrats placés ;</li>
            <li>S&apos;abstenir de toute démarche parallèle auprès des mêmes Partenaires pendant la durée du Mandat, en cas de clause d&apos;exclusivité.</li>
          </ul>
        </Section>

        {/* Article 9 */}
        <Section id="art9" n="9" title="Obligations de Finarent">
          <p>Finarent s&apos;engage à :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Exécuter sa mission avec diligence, loyauté et compétence, conformément aux règles déontologiques de la profession ;</li>
            <li>Conseiller le Client de manière objective, sur la base d&apos;une analyse impartiale d&apos;un nombre suffisant de contrats disponibles sur le marché (au moins trois compagnies pour les contrats d&apos;assurance) ;</li>
            <li>Informer le Client de tous les éléments susceptibles d&apos;éclairer son choix (caractéristiques essentielles, exclusions, franchises, plafonds, résiliation) ;</li>
            <li>Respecter le secret professionnel et les obligations de confidentialité (article L.511-33 CMF et RGPD) ;</li>
            <li>Maintenir à jour ses immatriculations ORIAS, sa garantie financière et son assurance RC Pro ;</li>
            <li>Respecter les obligations LCB-FT (articles L.561-1 et suivants CMF).</li>
          </ul>
          <Callout kind="info">
            <strong>Obligation de moyens, non de résultat.</strong> L&apos;obtention effective d&apos;un financement ou le placement d&apos;un contrat d&apos;assurance dépendent de l&apos;analyse souveraine du Partenaire. Finarent ne saurait être tenue responsable d&apos;un refus de placement par un Partenaire dès lors qu&apos;elle a déployé les diligences attendues.
          </Callout>
        </Section>

        {/* Article 10 */}
        <Section id="art10" n="10" title="Responsabilité">
          <Sub>10.1 — Régime général</Sub>
          <p>La responsabilité de Finarent ne peut être engagée que pour les manquements à ses obligations contractuelles relevant de l&apos;article 9, dans les conditions du droit commun. Cette responsabilité est limitée aux dommages directs et prévisibles imputables exclusivement à Finarent.</p>
          <Sub>10.2 — Exclusions</Sub>
          <p>Ne peuvent en aucun cas engager la responsabilité de Finarent :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Le refus d&apos;un Partenaire de placer ou d&apos;accepter un dossier ;</li>
            <li>La résiliation par un Partenaire d&apos;un contrat précédemment placé ;</li>
            <li>Les conséquences d&apos;informations inexactes, incomplètes ou tardives communiquées par le Client ;</li>
            <li>Les sinistres ou litiges relevant du contrat placé entre le Client et le Partenaire ;</li>
            <li>Les conséquences d&apos;événements de force majeure (article 1218 Code civil) ;</li>
            <li>Les dommages indirects (perte de chance, perte d&apos;exploitation, perte de CA), sauf à l&apos;égard du Consommateur dans les limites d&apos;ordre public.</li>
          </ul>
          <Sub>10.3 — Plafond de responsabilité<Badge kind="b2b">B2B</Badge></Sub>
          <p>Pour les Clients Professionnels et sauf disposition d&apos;ordre public contraire, la responsabilité de Finarent, toutes causes confondues, est limitée au montant des honoraires effectivement perçus pour la mission concernée, ou à défaut au montant des commissions perçues pour ledit dossier. Cette limitation ne s&apos;applique pas en cas de faute lourde ou intentionnelle.</p>
          <p>Pour les Clients Consommateurs<Badge kind="b2c">B2C</Badge>, aucune clause limitative de responsabilité ne peut être opposée en cas de dommage corporel, faute lourde ou intentionnelle, ou manquement aux obligations essentielles.</p>
        </Section>

        {/* Article 11 */}
        <Section id="art11" n="11" title="Données personnelles et confidentialité">
          <Sub>11.1 — Responsable de traitement</Sub>
          <p>Finarent est responsable de traitement au sens du RGPD (Règlement UE 2016/679) et de la loi Informatique et Libertés modifiée. Le responsable est M. LENS Sébastien Jean-Pierre.</p>
          <Sub>11.2 — Données collectées</Sub>
          <p>Identité, coordonnées (téléphone, email, adresse postale), informations professionnelles (raison sociale, SIRET, situation financière), justificatifs réglementaires (Kbis, statuts, comptes, déclarations TVA, RIB), données techniques liées à la navigation (adresse IP, cookies).</p>
          <Sub>11.3 — Finalités</Sub>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Exécution du Mandat et placement des contrats auprès des Partenaires ;</li>
            <li>Gestion de la relation commerciale et suivi des dossiers ;</li>
            <li>Respect des obligations légales (LCB-FT, archivage, déclarations fiscales) ;</li>
            <li>Prospection commerciale (sous consentement préalable du Consommateur) ;</li>
            <li>Mesure d&apos;audience du Site et amélioration des services.</li>
          </ul>
          <Sub>11.4 — Bases légales</Sub>
          <p>Exécution du contrat (art. 6.1.b RGPD), obligations légales (art. 6.1.c), intérêt légitime (art. 6.1.f), ou consentement explicite (art. 6.1.a) selon les cas.</p>
          <Sub>11.5 — Durées de conservation</Sub>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>5 ans après la fin du Mandat pour les données contractuelles et comptables (art. L.123-22 Code de commerce) ;</li>
            <li>5 ans pour les obligations LCB-FT (art. L.561-12 CMF) ;</li>
            <li>3 ans pour les données de prospection à compter du dernier contact ;</li>
            <li>13 mois pour les cookies de mesure d&apos;audience.</li>
          </ul>
          <Sub>11.6 — Droits des personnes concernées</Sub>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Droit d&apos;accès, de rectification et de suppression (art. 15, 16, 17 RGPD) ;</li>
            <li>Droit à la limitation du traitement (art. 18) ;</li>
            <li>Droit à la portabilité (art. 20) ;</li>
            <li>Droit d&apos;opposition (art. 21) ;</li>
            <li>Droit de définir des directives post-mortem (art. 85 loi Informatique et Libertés) ;</li>
            <li>Droit d&apos;introduire une réclamation auprès de la CNIL (3 place de Fontenoy, 75007 Paris, <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">www.cnil.fr</a>).</li>
          </ul>
          <p>Pour exercer ces droits : courrier postal à Finarent (39 av. de la République, 77340 Pontault-Combault) ou email, avec justificatif d&apos;identité. Réponse dans un délai d&apos;un mois maximum, prorogeable en cas de demandes complexes.</p>
          <Sub>11.7 — Sécurité des données</Sub>
          <p>Finarent met en œuvre les mesures techniques et organisationnelles appropriées. Les flux entre le Site et les serveurs sont chiffrés (HTTPS/TLS). Les données sont hébergées au sein de l&apos;Union européenne et chez Vercel Inc. (États-Unis) qui adhère au Data Privacy Framework UE-États-Unis.</p>
        </Section>

        {/* Article 12 */}
        <Section id="art12" n="12" title="Cookies">
          <p>Le Site utilise des cookies dans les conditions précisées dans sa <a href="/privacy" className="text-emerald-700 underline">politique de cookies</a>, accessible via le bandeau d&apos;information apparaissant lors de la première visite et via un lien permanent en pied de page. Les cookies non essentiels (mesure d&apos;audience, marketing) ne sont déposés qu&apos;après consentement explicite du visiteur.</p>
        </Section>

        {/* Article 13 */}
        <Section id="art13" n="13" title="Propriété intellectuelle">
          <p>L&apos;ensemble des éléments du Site (textes, logos, marques, images, vidéos, code source, structure de la base de données, charte graphique) est protégé par les droits de propriété intellectuelle et est la propriété exclusive de Finarent ou de tiers ayant autorisé son utilisation.</p>
          <p>Toute reproduction, représentation, modification, distribution ou exploitation, partielle ou totale, sans autorisation préalable écrite de Finarent, est strictement interdite et constitue un acte de contrefaçon au sens des articles L.335-2 et suivants du Code de la propriété intellectuelle.</p>
        </Section>

        {/* Article 14 */}
        <Section id="art14" n="14" title="Lutte contre le blanchiment et le financement du terrorisme">
          <p>Finarent est soumise aux obligations de vigilance prévues aux articles L.561-1 et suivants du Code monétaire et financier :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Identifier le Client et son bénéficiaire effectif sur présentation d&apos;un document officiel ;</li>
            <li>Recueillir des informations sur l&apos;objet et la nature envisagée de la relation d&apos;affaires ;</li>
            <li>Exercer une vigilance constante sur les opérations effectuées ;</li>
            <li>Déclarer à TRACFIN toute opération suspecte (sans en informer le Client) ;</li>
            <li>Conserver les pièces pendant 5 ans à compter de la fin de la relation d&apos;affaires.</li>
          </ul>
          <p>Le refus de fournir les justificatifs requis entraîne l&apos;impossibilité pour Finarent d&apos;exécuter sa mission.</p>
        </Section>

        {/* Article 15 */}
        <Section id="art15" n="15" title="Durée et résiliation du Mandat">
          <Sub>15.1 — Durée</Sub>
          <p>Sauf stipulation contraire, le Mandat est conclu pour une durée déterminée précisée dans le Mandat (généralement 6 à 12 mois). Il peut être renouvelé par accord exprès des parties.</p>
          <Sub>15.2 — Résiliation à l&apos;initiative du Client</Sub>
          <p>Le Client peut résilier le Mandat à tout moment, par lettre recommandée avec accusé de réception, moyennant un préavis de 30 jours. Toutefois, lorsqu&apos;un dossier a été placé ou est en cours d&apos;instruction avancée, la rémunération de Finarent reste due au titre du dossier concerné.</p>
          <Sub>15.3 — Résiliation à l&apos;initiative de Finarent</Sub>
          <p>Finarent peut résilier de plein droit, sans préavis et sans indemnité, en cas de : manquement grave du Client ; communication d&apos;informations fausses ; refus de coopérer aux obligations LCB-FT ; procédure collective ; conflit d&apos;intérêts manifeste.</p>
        </Section>

        {/* Article 16 */}
        <Section id="art16" n="16" title="Médiation, réclamations et règlement des litiges">
          <Sub>16.1 — Service réclamations</Sub>
          <p>Toute réclamation doit être adressée au service client ou par courrier au siège social. Finarent accuse réception dans un délai de 10 jours ouvrés et apporte une réponse motivée dans un délai maximum de 2 mois (Recommandation ACPR 2022-R-01).</p>
          <Sub>16.2 — Médiateur de la consommation<Badge kind="b2c">B2C</Badge></Sub>
          <p>Conformément à l&apos;article L.612-1 du Code de la consommation, le Client Consommateur peut, en cas de litige persistant, recourir gratuitement au médiateur compétent :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Litiges assurance :</strong> La Médiation de l&apos;Assurance — TSA 50110, 75441 Paris Cedex 09 — <a href="https://www.mediation-assurance.org" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">www.mediation-assurance.org</a></li>
            <li><strong>Litiges IOBSP :</strong> Médiateur ASF — 75834 Paris Cedex 17 — <a href="https://lemediateur.asf-france.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">lemediateur.asf-france.com</a></li>
          </ul>
          <Sub>16.3 — Plateforme européenne RLL</Sub>
          <p>Conformément à l&apos;article 14 du règlement (UE) n° 524/2013 : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">ec.europa.eu/consumers/odr</a>.</p>
          <Sub>16.4 — Juridiction compétente</Sub>
          <p><strong>Consommateurs<Badge kind="b2c">B2C</Badge> :</strong> juridictions du lieu du domicile du Consommateur ou de l&apos;établissement de Finarent, au choix du demandeur.</p>
          <p><strong>Professionnels<Badge kind="b2b">B2B</Badge> :</strong> tout litige est de la compétence exclusive du Tribunal de Commerce de Melun, nonobstant pluralité de défendeurs ou appel en garantie.</p>
        </Section>

        {/* Article 17 */}
        <Section id="art17" n="17" title="Force majeure">
          <p>Aucune des parties ne pourra être tenue responsable d&apos;un manquement résultant d&apos;un cas de force majeure (article 1218 du Code civil). Sont notamment considérés comme tels : catastrophes naturelles, pandémies, guerres, attentats, grèves générales, défaillance des réseaux, décisions des autorités publiques. Si la situation perdure plus de 60 jours, chaque partie pourra résilier de plein droit, sans indemnité.</p>
        </Section>

        {/* Article 18 */}
        <Section id="art18" n="18" title="Dispositions générales">
          <Sub>18.1 — Nullité partielle</Sub>
          <p>Si une ou plusieurs stipulations étaient déclarées nulles, les autres conserveraient toute leur force.</p>
          <Sub>18.2 — Tolérance</Sub>
          <p>Le fait pour Finarent de ne pas se prévaloir à un moment donné de l&apos;une des stipulations ne peut être interprété comme une renonciation.</p>
          <Sub>18.3 — Modification des CGV</Sub>
          <p>Finarent se réserve le droit de modifier les CGV à tout moment. Les nouvelles CGV s&apos;appliquent aux contrats conclus postérieurement à leur publication. Pour les Mandats en cours, les CGV applicables demeurent celles de la date de conclusion, sauf accord exprès du Client.</p>
          <Sub>18.4 — Langue</Sub>
          <p>Les présentes CGV sont rédigées en français. Seule la version française fait foi.</p>
          <Sub>18.5 — Loi applicable</Sub>
          <p>Les présentes CGV sont soumises au droit français.</p>
        </Section>

        {/* Article 19 */}
        <Section id="art19" n="19" title="Acceptation">
          <p>L&apos;acceptation des présentes CGV résulte :</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>De la signature du Mandat ;</li>
            <li>Ou du cochage de la case « J&apos;ai lu et j&apos;accepte les CGV » lors de la prise de contact en ligne ;</li>
            <li>Ou de tout commencement d&apos;exécution de la prestation.</li>
          </ul>
          <p>Le Client reconnaît disposer de la pleine capacité juridique. Pour les personnes morales, le signataire garantit disposer du pouvoir d&apos;engager la personne morale qu&apos;il représente.</p>
        </Section>

        {/* Annexes */}
        <section id="annexes" className="scroll-mt-24 mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-primary border-b border-gray-200 pb-2 mb-4">Annexes</h2>

          <Sub>Annexe 1 — Formulaire-type de rétractation<Badge kind="b2c">B2C</Badge></Sub>
          <p className="italic text-sm text-gray-600">À l&apos;attention de Finarent — 39 avenue de la République, 77340 Pontault-Combault.</p>
          <p className="italic text-sm text-gray-600">Je / nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la prestation de services ci-dessous :</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-700">
            <li>Référence du Mandat / contrat : __________________________________</li>
            <li>Commandé le ____ / ____ / ________</li>
            <li>Nom du Consommateur : __________________________________</li>
            <li>Adresse du Consommateur : __________________________________</li>
            <li>Signature (uniquement en cas de notification papier) : __________________________________</li>
            <li>Date : ____ / ____ / ________</li>
          </ul>
          <p className="text-xs italic text-gray-500 mt-2">(*) Rayer la mention inutile</p>

          <Sub>Annexe 2 — Coordonnées des médiateurs et autorités</Sub>
          <div className="overflow-x-auto my-4 rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr><th className="text-left p-3">Organisme</th><th className="text-left p-3">Coordonnées</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="p-3">Médiateur de l&apos;Assurance</td><td className="p-3">TSA 50110, 75441 Paris Cedex 09 — <a href="https://www.mediation-assurance.org" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">www.mediation-assurance.org</a></td></tr>
                <tr><td className="p-3">Médiateur ASF (IOBSP)</td><td className="p-3">75834 Paris Cedex 17 — <a href="https://lemediateur.asf-france.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">lemediateur.asf-france.com</a></td></tr>
                <tr><td className="p-3">Plateforme RLL européenne</td><td className="p-3"><a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">ec.europa.eu/consumers/odr</a></td></tr>
                <tr><td className="p-3">ACPR</td><td className="p-3">4 Place de Budapest, 75009 Paris — <a href="https://acpr.banque-france.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">acpr.banque-france.fr</a></td></tr>
                <tr><td className="p-3">ORIAS</td><td className="p-3">1 rue Jules Lefebvre, 75009 Paris — <a href="https://www.orias.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">www.orias.fr</a></td></tr>
                <tr><td className="p-3">CNIL</td><td className="p-3">3 place de Fontenoy, 75007 Paris — <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">www.cnil.fr</a></td></tr>
                <tr><td className="p-3">TRACFIN</td><td className="p-3">10 rue Auguste Blanqui, 93186 Montreuil</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-16 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center space-y-1">
          <p>
            <strong>FINARENT</strong> — SAS au capital de 10 000 € — Siège : 39 av. de la République, 77340 Pontault-Combault
          </p>
          <p>
            RCS Melun [N° à compléter] · ORIAS [N° à compléter] · <a href="https://finarrent.vercel.app" className="text-emerald-700 underline">finarrent.vercel.app</a>
          </p>
          <p className="italic">© Finarent — Tous droits réservés · Document généré le 13 mai 2026</p>
        </footer>
      </div>
    </div>
  );
}
