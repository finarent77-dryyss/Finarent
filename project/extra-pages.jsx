/* Final additions: Process, Why-leasing, Comparateur, Testimonials, FAQ, Contact, About, Blog, Notifications, Parrainage, Security, Insurer, Splash */

/* === PROCESS (timeline éditorial) === */
function PageProcess() {
  const steps = [
    { n: '01', t: 'Vous nous contactez', d: 'Formulaire en ligne, appel, ou via votre apporteur d\'affaires. Pré-qualification immédiate par notre IA de scoring.', dur: '5 min', icon: '✦' },
    { n: '02', t: 'Étude personnalisée', d: 'Un conseiller dédié construit votre dossier : analyse 3 derniers bilans, étude de capacité, optimisation fiscale.', dur: '24 h', icon: '◇' },
    { n: '03', t: 'Mise en concurrence', d: 'Nous interrogeons 47 partenaires bancaires en parallèle. Vous recevez 3 à 5 offres comparées.', dur: '48 h', icon: '◐' },
    { n: '04', t: 'Signature électronique', d: 'Sélection de l\'offre, signature DocuSign certifiée eIDAS, conditions verrouillées.', dur: '15 min', icon: '⊕' },
    { n: '05', t: 'Mise à disposition', d: 'Virement direct au fournisseur ou réception du matériel. Vous démarrez votre activité.', dur: '7 j', icon: '◉' },
  ];
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <PublicHeader />
      <div style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Notre méthode</span>
        <h1 className="fr-h1 fr-serif" style={{ marginTop: 12, maxWidth: 800 }}>Du premier appel à la mise à disposition, <em style={{ color: 'var(--fr-accent-deep)' }}>10 jours.</em></h1>
        <p className="fr-body-lg" style={{ marginTop: 20, maxWidth: 640 }}>Un processus éprouvé sur 2 400+ dossiers. Transparent, rapide, sans paperasse inutile.</p>

        <div style={{ marginTop: 80, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 47, top: 30, bottom: 30, width: 2, background: 'linear-gradient(to bottom, var(--fr-accent), var(--fr-line))' }} />
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 32, paddingBottom: 56, position: 'relative' }}>
              <div>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--fr-ink)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 24, color: 'var(--fr-accent)' }}>{s.icon}</div>
                  <div className="fr-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.n}</div>
                </div>
              </div>
              <div className="fr-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h3 className="fr-serif" style={{ fontSize: 28 }}>{s.t}</h3>
                  <span className="fr-pill fr-pill-ok">{s.dur}</span>
                </div>
                <p className="fr-body" style={{ marginTop: 12 }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* === WHY LEASING === */
function PageWhyLeasing() {
  const benefits = [
    { t: 'Trésorerie préservée', d: 'Pas d\'apport. Mensualités prévisibles, étalées sur la durée d\'usage.', stat: '0€', sub: 'd\'apport requis' },
    { t: 'Avantages fiscaux', d: 'Loyers déductibles à 100% du résultat imposable. TVA récupérable mensuellement.', stat: '100%', sub: 'déductibles' },
    { t: 'Renouvellement facile', d: 'Évitez l\'obsolescence. À échéance : levée d\'option, restitution ou renouvellement.', stat: '3', sub: 'options en sortie' },
    { t: 'Ratios bancaires', d: 'Pas d\'impact sur votre capacité d\'endettement. Préserve votre cotation Banque de France.', stat: 'Off', sub: 'bilan' },
  ];
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg-deep)', color: 'white' }}>
      <PublicHeader dark />
      <div style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ maxWidth: 720 }}>
          <span className="fr-eyebrow" style={{ color: 'var(--fr-accent)' }}>· Pourquoi le leasing ?</span>
          <h1 className="fr-h1 fr-serif" style={{ marginTop: 12, color: 'white' }}>Acheter, c'est immobiliser. <em style={{ color: 'var(--fr-accent)' }}>Louer, c'est avancer.</em></h1>
          <p style={{ marginTop: 20, fontSize: 19, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>78% des entreprises du SBF 120 financent leur outil de production en leasing. Voici pourquoi vous devriez les imiter.</p>
        </div>

        <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ padding: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
              <Halo color="var(--fr-accent)" size={200} opacity={0.2} top={-80} right={-50} blur={60} />
              <div style={{ position: 'relative' }}>
                <div className="fr-serif" style={{ fontSize: 56, color: 'var(--fr-accent)', letterSpacing: '-0.03em' }}>{b.stat}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{b.sub}</div>
                <h3 className="fr-serif" style={{ fontSize: 26, marginTop: 24, color: 'white' }}>{b.t}</h3>
                <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.5 }}>{b.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 64, padding: 40, background: 'var(--fr-accent)', color: 'var(--fr-ink)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="fr-serif" style={{ fontSize: 32 }}>Et concrètement, pour vous ?</h3>
            <p style={{ marginTop: 8, fontSize: 16 }}>Lancez une simulation. Vous verrez la différence en chiffres.</p>
          </div>
          <a href="#" className="fr-btn" style={{ background: 'var(--fr-ink)', color: 'white' }}>Simuler mon financement →</a>
        </div>
      </div>
    </div>
  );
}

/* === COMPARATEUR (achat vs leasing) === */
function PageComparateur() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <PublicHeader />
      <div style={{ padding: '60px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Comparateur</span>
        <h1 className="fr-h1 fr-serif" style={{ marginTop: 12 }}>Achat comptant vs leasing.</h1>
        <p className="fr-body-lg" style={{ marginTop: 16, maxWidth: 640 }}>Cas concret : un véhicule utilitaire à 35 000 € HT pour une PME au régime BIC.</p>

        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { t: 'Achat comptant', s: 'Vous immobilisez', items: [['Décaissement immédiat', '35 000 €'], ['Trésorerie nette', '-35 000 €'], ['Amortissement (5 ans)', '7 000 €/an'], ['Économie d\'IS (25%)', '1 750 €/an'], ['Impact bilan', 'Actif immobilisé']], total: 'Coût net 5 ans', val: '26 250 €', tone: 'neutral' },
            { t: 'Leasing', s: 'Vous avancez', items: [['Apport', '0 €'], ['Loyer mensuel', '598 €'], ['Loyers totaux 5 ans', '35 880 €'], ['Économie d\'IS (25%)', '8 970 €'], ['Impact bilan', 'Hors bilan']], total: 'Coût net 5 ans', val: '26 910 €', tone: 'accent' },
          ].map((c, i) => (
            <div key={i} className="fr-card" style={{ padding: 32, position: 'relative', overflow: 'hidden', borderColor: c.tone === 'accent' ? 'var(--fr-accent)' : 'var(--fr-line)', borderWidth: c.tone === 'accent' ? 2 : 1 }}>
              {c.tone === 'accent' && <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, padding: '4px 10px', background: 'var(--fr-accent)', color: 'var(--fr-ink)', borderRadius: 999, fontWeight: 700, letterSpacing: '0.1em' }}>RECOMMANDÉ</div>}
              <span className="fr-eyebrow" style={{ color: 'var(--fr-text-soft)' }}>{c.s}</span>
              <h3 className="fr-serif" style={{ fontSize: 36, marginTop: 6 }}>{c.t}</h3>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {c.items.map((it, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--fr-line-cool)' }}>
                    <span style={{ fontSize: 13, color: 'var(--fr-text-muted)' }}>{it[0]}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{it[1]}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, padding: 18, background: c.tone === 'accent' ? 'var(--fr-accent-soft)' : 'var(--fr-bg-cool)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.total}</span>
                <span className="fr-serif" style={{ fontSize: 36 }}>{c.val}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 28, background: 'var(--fr-ink)', color: 'white', borderRadius: 12 }}>
          <span className="fr-eyebrow" style={{ color: 'var(--fr-accent)' }}>· La nuance qui change tout</span>
          <p style={{ marginTop: 12, fontSize: 17, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>Le coût net est quasi équivalent — mais en leasing, vos 35 000 € restent disponibles pour développer votre activité, financer votre BFR, ou saisir une opportunité.</p>
        </div>
      </div>
    </div>
  );
}

/* === TESTIMONIALS === */
function PageTestimonials() {
  const testimonials = [
    { name: 'Marc Régis', role: 'Dir. Régis Construction · Lyon', q: 'En 8 jours, on a financé 3 mini-pelles Komatsu. Notre banquier mettait 6 semaines pour la même chose.', stat: '420 k€', secteur: 'BTP' },
    { name: 'Laure Brindille', role: 'Pharma Brindille · Bordeaux', q: 'Le scoring IA est bluffant. Dossier complet en 24h, 4 offres reçues. On a choisi celle de BNP en 5 minutes.', stat: '92 k€', secteur: 'Médical' },
    { name: 'Aymeric Cottin', role: 'Cottin Industries · Lille', q: 'Sept ans qu\'on bosse avec eux. Sur 18 dossiers, jamais une déception. Conseillers qui connaissent vraiment l\'industrie.', stat: '2.4 M€', secteur: 'BTP' },
    { name: 'Studio Lumière', role: 'Aurélie Vargas · Paris', q: 'Pour un studio photo, financer du matos optique c\'est compliqué. Eux ont compris en 5 min, offre en 48h.', stat: '24 k€', secteur: 'Créatif' },
  ];
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg-warm)' }}>
      <PublicHeader />
      <div style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Ils nous font confiance</span>
        <h1 className="fr-h1 fr-serif" style={{ marginTop: 12, maxWidth: 800 }}><em style={{ fontStyle: 'italic' }}>« Le seul partenaire qui ne nous a jamais ralenti. »</em></h1>
        <p className="fr-body-lg" style={{ marginTop: 16 }}>2 400+ entreprises financées depuis 2017. Voici 4 d'entre elles.</p>

        <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {testimonials.map((t, i) => (
            <div key={i} className="fr-card" style={{ padding: 36, background: 'white', position: 'relative' }}>
              <div className="fr-serif" style={{ fontSize: 80, color: 'var(--fr-accent)', position: 'absolute', top: 8, left: 24, opacity: 0.4, lineHeight: 1 }}>"</div>
              <p className="fr-serif" style={{ fontSize: 22, lineHeight: 1.35, color: 'var(--fr-text)', position: 'relative', fontStyle: 'italic' }}>{t.q}</p>
              <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--fr-line-cool)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="fr-avatar" style={{ width: 44, height: 44, fontSize: 14 }}>{t.name.split(' ').map(x => x[0]).slice(0, 2).join('')}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fr-text-soft)' }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="fr-serif" style={{ fontSize: 24 }}>{t.stat}</div>
                  <div style={{ fontSize: 11, color: 'var(--fr-text-soft)' }}>{t.secteur}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* === FAQ === */
function PageFAQ() {
  const cats = [
    { t: 'Le financement', q: [['Quel est le montant minimum ?', '5 000 € HT pour le crédit-bail mobilier, 10 000 € pour la LOA véhicule.'], ['Faut-il un apport ?', 'Non. 0% d\'apport sur 92% de nos dossiers. Possibilité de premier loyer majoré pour optimiser fiscalement.'], ['Quelle durée ?', 'De 24 à 84 mois selon le bien financé. Standard : 60 mois pour le mobilier, 48 pour les véhicules.']] },
    { t: 'L\'éligibilité', q: [['Combien de bilans ?', 'Idéalement 3 bilans clos. Pour les TPE et start-ups, nous avons des partenaires sur 1 bilan ou bilan en cours.'], ['Et les jeunes entreprises ?', 'À partir de 6 mois d\'activité avec K-bis et compte courant. Caution dirigeant possible.'], ['Auto-entrepreneurs ?', 'Pas de leasing classique mais nous proposons d\'autres solutions de financement adaptées.']] },
    { t: 'Le processus', q: [['Quels documents ?', '3 derniers bilans, K-bis -3 mois, RIB pro, pièce d\'identité dirigeant. 12 documents max selon le dossier.'], ['Délai de réponse ?', 'Pré-accord en 24h. Offres définitives en 48-72h après dossier complet.'], ['Signature à distance ?', 'Oui, 100% en ligne via DocuSign certifié eIDAS niveau substantiel.']] },
  ];
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <PublicHeader />
      <div style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Questions fréquentes</span>
        <h1 className="fr-h1 fr-serif" style={{ marginTop: 12 }}>On a déjà répondu, probablement.</h1>

        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48 }}>
          <aside style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cats.map((c, i) => (
                <a key={i} href={`#cat-${i}`} className="fr-nav-link" style={{ padding: '10px 14px', borderLeft: i === 0 ? '2px solid var(--fr-accent)' : '2px solid transparent' }}>{c.t}</a>
              ))}
            </div>
          </aside>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {cats.map((c, i) => (
              <div key={i} id={`cat-${i}`}>
                <h2 className="fr-serif" style={{ fontSize: 28 }}>{c.t}</h2>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {c.q.map((qa, j) => (
                    <details key={j} className="fr-card" style={{ padding: '20px 24px', cursor: 'pointer' }}>
                      <summary style={{ fontWeight: 600, fontSize: 16, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{qa[0]}</span>
                        <span style={{ color: 'var(--fr-accent-deep)', fontSize: 20 }}>+</span>
                      </summary>
                      <p className="fr-body" style={{ marginTop: 12 }}>{qa[1]}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* === CONTACT === */
function PageContact() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <PublicHeader />
      <div style={{ padding: '60px 40px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        <div>
          <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Parlons-en</span>
          <h1 className="fr-h1 fr-serif" style={{ marginTop: 12 }}>Un projet de <em>10 k€ ou 10 M€ ?</em></h1>
          <p className="fr-body-lg" style={{ marginTop: 20 }}>Notre équipe d'analystes vous rappelle dans l'heure, en jours ouvrés.</p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { i: '☎', l: 'Téléphone', v: '+33 1 84 60 24 80', s: 'Lun-Ven · 9h-19h' },
              { i: '✉', l: 'Email', v: 'contact@finarent.fr', s: 'Réponse < 4h ouvrées' },
              { i: '◉', l: 'Bureau', v: '12 rue Auber, 75009 Paris', s: 'Sur rendez-vous' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--fr-accent-soft)', color: 'var(--fr-accent-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{c.i}</div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>{c.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{c.v}</div>
                  <div style={{ fontSize: 13, color: 'var(--fr-text-muted)', marginTop: 2 }}>{c.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fr-card" style={{ padding: 36 }}>
          <h3 className="fr-serif" style={{ fontSize: 26 }}>Décrivez votre projet</h3>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              ['Société', 'Régis Construction SAS'],
              ['Vous êtes', 'Marc Régis · Gérant'],
              ['Email pro', 'marc@regis-btp.fr'],
              ['Téléphone', '06 12 34 56 78'],
            ].map((f, i) => (
              <div key={i}>
                <label style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{f[0]}</label>
                <input value={f[1]} readOnly style={{ width: '100%', padding: '12px 14px', marginTop: 6, border: '1px solid var(--fr-line)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Votre projet</label>
              <textarea readOnly value="Financement de 3 mini-pelles Komatsu pour notre activité de terrassement. Budget total ~340 k€ HT, livraison en mars 2026." style={{ width: '100%', padding: '12px 14px', marginTop: 6, border: '1px solid var(--fr-line)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', minHeight: 100, resize: 'vertical' }} />
            </div>
            <button className="fr-btn fr-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Envoyer ma demande →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* === PARRAINAGE === */
function PageParrainage() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <ClientHeader />
      <div style={{ padding: '40px', maxWidth: 1100, margin: '0 auto' }}>
        <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Parrainage</span>
        <h1 className="fr-h2 fr-serif" style={{ marginTop: 8 }}>Parrainez. Encaissez.</h1>
        <p className="fr-body-lg" style={{ marginTop: 12, maxWidth: 580 }}>500 € pour vous, 500 € pour votre filleul, à chaque dossier signé.</p>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <div className="fr-card" style={{ padding: 32, background: 'var(--fr-ink)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <Halo color="var(--fr-accent)" size={300} opacity={0.3} top={-80} right={-80} blur={80} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Votre lien de parrainage</div>
              <div style={{ marginTop: 12, padding: 16, background: 'rgba(255,255,255,0.08)', borderRadius: 10, fontFamily: 'var(--fr-mono)', fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>finarent.fr/r/aurelie-r-x4k2</span>
                <button style={{ padding: '6px 12px', background: 'var(--fr-accent)', color: 'var(--fr-ink)', border: 0, borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Copier</button>
              </div>
              <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {[['12', 'Filleuls'], ['7', 'Signatures'], ['3 500 €', 'Encaissés']].map((s, i) => (
                  <div key={i}>
                    <div className="fr-serif" style={{ fontSize: 32, color: 'var(--fr-accent)' }}>{s[0]}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="fr-card" style={{ padding: 28 }}>
            <h3 className="fr-serif" style={{ fontSize: 22 }}>Comment ça marche ?</h3>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[['1', 'Partagez votre lien'], ['2', 'Votre filleul démarre une simulation'], ['3', 'À la signature : 500 € pour chacun']].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--fr-accent-soft)', color: 'var(--fr-accent-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{s[0]}</div>
                  <div style={{ fontSize: 14, paddingTop: 4 }}>{s[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fr-card" style={{ marginTop: 24, padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--fr-line-cool)' }}><h3 style={{ fontSize: 15, fontWeight: 600 }}>Mes filleuls</h3></div>
          <table className="fr-table">
            <thead><tr><th>Filleul</th><th>Inscription</th><th>Statut</th><th>Récompense</th></tr></thead>
            <tbody>
              {[['Atelier Bois & Co', '12 mars', 'Signé', 'ok', '500 €'], ['Pharma Brindille', '8 mars', 'Étude', 'info', '—'], ['IT Services', '2 mars', 'Signé', 'ok', '500 €'], ['Studio Vague', '24 fév', 'Abandonné', 'neutral', '—']].map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td><span className={`fr-pill fr-pill-${r[3]}`}>{r[2]}</span></td>
                  <td style={{ fontWeight: 600, color: r[4] === '—' ? 'var(--fr-text-soft)' : 'var(--fr-accent-deep)' }}>{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* === INSURER dashboard (assureur) === */
function PageInsurer() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <div className="fr-nav" style={{ borderBottom: '1px solid var(--fr-line)', background: 'white' }}>
        <FinarentLogo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="fr-tag fr-pill-info">Assureur · CNP Assurances</span>
          <div className="fr-avatar">EM</div>
        </div>
      </div>
      <div style={{ padding: 32, maxWidth: 1280, margin: '0 auto' }}>
        <span className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>· Espace assureur</span>
        <h1 className="fr-h2 fr-serif" style={{ marginTop: 6 }}>Sinistres & polices · vue d'ensemble.</h1>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[['Polices actives', '847', '+24'], ['Sinistres ouverts', '12', '-3'], ['Prime annuelle', '2.84 M€', '+8%'], ['Sinistralité', '14.2%', '-1.8 pts']].map((k, i) => (
            <div key={i} className="fr-kpi" style={{ padding: 18 }}>
              <div className="fr-kpi-label">{k[0]}</div>
              <div className="fr-kpi-value">{k[1]}</div>
              <div className="fr-kpi-delta">{k[2]}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="fr-card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Sinistres récents</h3>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['SIN-1284', 'Régis Construction', 'Bris matériel', '12 400 €', 'En cours', 'warn'], ['SIN-1283', 'Cottin Industries', 'Vol équipement', '38 500 €', 'Expertisé', 'info'], ['SIN-1282', 'TX Logistics', 'Accident', '4 200 €', 'Réglé', 'ok']].map((s, i) => (
                <div key={i} style={{ padding: 14, background: 'var(--fr-bg-cool)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="fr-mono" style={{ fontSize: 11, color: 'var(--fr-text-soft)' }}>{s[0]}</span>
                    <span className={`fr-pill fr-pill-${s[5]}`}>{s[4]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s[1]}</div>
                      <div style={{ fontSize: 12, color: 'var(--fr-text-muted)' }}>{s[2]}</div>
                    </div>
                    <div className="fr-serif" style={{ fontSize: 22 }}>{s[3]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="fr-card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Répartition risques</h3>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['BTP', 38, '#D97706'], ['Industrie', 24, 'var(--fr-indigo)'], ['Transport', 18, 'var(--fr-accent)'], ['Médical', 12, '#5B6B82'], ['Autre', 8, '#94A3B8']].map((r, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span>{r[0]}</span><span style={{ color: 'var(--fr-text-muted)' }}>{r[1]}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--fr-bg-cool)', borderRadius: 4 }}>
                    <div style={{ width: `${r[1]}%`, height: '100%', background: r[2], borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* === SPLASH (marque) === */
function PageSplash() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--fr-bg-deep)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Halo color="var(--fr-accent)" size={900} opacity={0.45} top={-200} left={-100} blur={160} />
      <Halo color="var(--fr-indigo)" size={700} opacity={0.35} bottom={-150} right={-100} blur={140} />
      <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
        <FinarentLogo color="white" size={48} />
        <div className="fr-serif" style={{ fontSize: 80, color: 'white', letterSpacing: '-0.04em', marginTop: 60, lineHeight: 1 }}>
          Le leasing,
          <br />
          <em style={{ color: 'var(--fr-accent)' }}>simplifié.</em>
        </div>
        <p style={{ marginTop: 32, fontSize: 17, color: 'rgba(255,255,255,0.6)', maxWidth: 460, margin: '32px auto 0' }}>
          Depuis 2017. 2 400 PME. 124 M€ financés. Une exigence qui ne change pas.
        </p>
        <div style={{ marginTop: 48, display: 'inline-flex', gap: 12 }}>
          <div style={{ width: 48, height: 4, background: 'var(--fr-accent)', borderRadius: 2 }} />
          <div style={{ width: 16, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
          <div style={{ width: 16, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PageProcess, PageWhyLeasing, PageComparateur, PageTestimonials, PageFAQ, PageContact, PageParrainage, PageInsurer, PageSplash });
