/* Public pages — Finarent refresh
   Each page = a self-contained 1280×N frame, scrollable inside its DCArtboard.
   Heavy use of parallax, halos, grain, scroll reveal. */

/* === HOME (immersive) === */
function PageHome() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg-deep)', position: 'relative' }}>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: 880, color: 'white', overflow: 'hidden' }}>
        <div className="fr-aurora fr-grain fr-grain-dark" style={{ position: 'absolute', inset: 0 }}>
          <div className="fr-stars" />
        </div>
        <MouseParallax depth={18} style={{ position: 'absolute', inset: 0 }}>
          <Halo color="var(--fr-accent)" size={680} opacity={0.45} top={-80} left={-100} blur={110} />
          <Halo color="var(--fr-indigo)" size={560} opacity={0.38} top={120} right={-80} blur={130} />
        </MouseParallax>

        <div style={{ position: 'relative', zIndex: 4 }}>
          <PublicHeader dark />
          <div style={{ padding: '80px 80px 60px', maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <span className="fr-tag" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.85)' }}>
                <span className="fr-live-dot" /> Courtage en financement & assurance pro · ORIAS 23 004 891
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="fr-h1 fr-serif" style={{ marginTop: 28, color: 'white', maxWidth: 940 }}>
                Le financement<br />
                <em style={{ color: 'var(--fr-accent)', fontStyle: 'italic' }}>sur-mesure</em> des entreprises<br />
                qui décident vite.
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="fr-body-lg" style={{ marginTop: 28, color: 'rgba(255,255,255,0.7)', maxWidth: 620 }}>
                Crédit-bail, LOA, leasing opérationnel, RC Pro. Une demande, 30 partenaires bancaires consultés, une offre signée en 72 h.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div style={{ display: 'flex', gap: 14, marginTop: 36, alignItems: 'center' }}>
                <a href="#" className="fr-btn fr-btn-accent">Démarrer une simulation →</a>
                <a href="#" className="fr-btn" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.18)' }}>Parler à un conseiller</a>
              </div>
            </Reveal>
          </div>

          {/* Floating preview card with parallax */}
          <div style={{ position: 'relative', padding: '0 80px 60px', maxWidth: 1280, margin: '0 auto' }}>
            <Parallax speed={0.08}>
              <div className="fr-glass-dark" style={{ borderRadius: 22, padding: 24, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
                {/* Live ticker */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>Marché en direct</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}><span className="fr-live-dot" />Mise à jour il y a 2 min</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    {[
                      { l: 'Taux moyen crédit-bail', v: '4.82', s: '%', d: '−0.12 pt cette semaine' },
                      { l: 'Délai moyen offre', v: '72', s: 'h', d: '−18% vs marché' },
                      { l: 'Taux d\'acceptation', v: '94', s: '%', d: '+3 pts en 30 j' },
                    ].map((x, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{x.l}</div>
                        <div className="fr-serif" style={{ fontSize: 44, color: 'white', lineHeight: 1, marginTop: 6, letterSpacing: '-0.02em' }}>
                          <Counter to={parseFloat(x.v)} format={n => x.s === '%' && x.v.includes('.') ? n.toFixed(2) : Math.round(n).toLocaleString('fr-FR')} />
                          <span style={{ fontSize: 22, marginLeft: 4, color: 'rgba(255,255,255,0.6)' }}>{x.s}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fr-accent)', marginTop: 6 }}>{x.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Mini wizard */}
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 20 }}>
                  <div className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>Estimation rapide</div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Montant à financer</div>
                    <div className="fr-serif" style={{ fontSize: 32, color: 'white', letterSpacing: '-0.02em' }}>85 000 €</div>
                    <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: '42%', height: '100%', background: 'var(--fr-accent)' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['24 mois', '36 mois', '48 mois', '60 mois'].map((d, i) => (
                      <span key={i} className="fr-tag" style={{ background: i === 1 ? 'var(--fr-accent)' : 'rgba(255,255,255,0.06)', borderColor: i === 1 ? 'transparent' : 'rgba(255,255,255,0.14)', color: i === 1 ? 'var(--fr-ink)' : 'rgba(255,255,255,0.8)', fontSize: 11.5 }}>{d}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: 18, padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Mensualité estimée</div>
                    <div className="fr-serif" style={{ fontSize: 28, color: 'var(--fr-accent)', letterSpacing: '-0.02em' }}>2 487 € <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--fr-sans)' }}>/ mois HT</span></div>
                  </div>
                </div>
              </div>
            </Parallax>
          </div>

          {/* Logos */}
          <div style={{ padding: '20px 80px 60px', maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 18 }}>Réseau de 30+ partenaires bancaires & assureurs</div>
            <PartnerMarquee dark />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'var(--fr-bg)', position: 'relative', padding: '120px 80px' }}>
        <AmbientBg variant="warm" />
        <div style={{ position: 'relative', maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Chiffres clés</span>
            <h2 className="fr-h2 fr-serif" style={{ marginTop: 18, maxWidth: 700 }}>
              4 ans de courtage. <em style={{ color: 'var(--fr-accent-deep)' }}>2 800 entreprises</em> financées.
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginTop: 60, borderTop: '1px solid var(--fr-line)' }}>
            {[
              { v: 2847, suffix: '', l: 'Dossiers financés' },
              { v: 412, suffix: ' M€', l: 'Volume débloqué' },
              { v: 94, suffix: ' %', l: 'Taux d\'acceptation' },
              { v: 72, suffix: ' h', l: 'Délai moyen offre' },
            ].map((x, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{ padding: '40px 20px 0', borderRight: i < 3 ? '1px solid var(--fr-line)' : 'none' }}>
                  <div className="fr-serif" style={{ fontSize: 64, lineHeight: 0.95, letterSpacing: '-0.025em', color: 'var(--fr-ink)' }}>
                    <Counter to={x.v} suffix={x.suffix} />
                  </div>
                  <div style={{ marginTop: 16, fontSize: 13.5, color: 'var(--fr-text-muted)' }}>{x.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section style={{ background: 'var(--fr-bg-cool)', padding: '120px 80px', position: 'relative', overflow: 'hidden' }}>
        <AmbientBg variant="cool" />
        <div style={{ position: 'relative', maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 50 }}>
              <div>
                <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Secteurs</span>
                <h2 className="fr-h2 fr-serif" style={{ marginTop: 14, maxWidth: 580 }}>Une expertise par métier, pas un script générique.</h2>
              </div>
              <a href="#" className="fr-btn fr-btn-ghost">Voir les 8 secteurs →</a>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { n: 'BTP & Construction', e: '+18%', d: 'Engins, échafaudages, véhicules utilitaires' },
              { n: 'Médical & Santé', e: '+24%', d: 'Imagerie, fauteuils, équipement cabinet' },
              { n: 'IT & Tech', e: '+31%', d: 'Serveurs, parc informatique, SaaS lease' },
              { n: 'Transport & Logistique', e: '+12%', d: 'Flottes VL/VU, poids lourds, frigorifique' },
              { n: 'Industrie', e: '+9%', d: 'Machines-outils, robotique, lignes de prod' },
              { n: 'Commerce', e: '+15%', d: 'Aménagement, encaissement, vitrine' },
              { n: 'Restauration', e: '+22%', d: 'Cuisine pro, mobilier, terrasses' },
              { n: 'Services', e: '+11%', d: 'Bureautique, véhicules, équipement' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="fr-card" style={{ padding: 20, height: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all .3s' }}>
                  <div>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--fr-bg)', border: '1px solid var(--fr-line)', display: 'grid', placeItems: 'center', fontFamily: 'var(--fr-serif)', fontSize: 20, color: 'var(--fr-ink)' }}>
                      {s.n.split(' ')[0].slice(0, 2)}
                    </div>
                    <div style={{ marginTop: 16, fontSize: 15.5, fontWeight: 600, color: 'var(--fr-ink)' }}>{s.n}</div>
                    <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--fr-text-muted)', lineHeight: 1.5 }}>{s.d}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--fr-text-soft)' }}>
                    <span>Demandes 2026</span>
                    <span style={{ color: 'var(--fr-accent-deep)', fontWeight: 600 }}>{s.e}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section style={{ background: 'var(--fr-bg)', padding: '120px 80px', position: 'relative' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Process</span>
            <h2 className="fr-h2 fr-serif" style={{ marginTop: 14 }}>De la demande au déblocage des fonds, <em style={{ color: 'var(--fr-accent-deep)' }}>en 4 étapes</em>.</h2>
          </Reveal>
          <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 24, left: '12.5%', right: '12.5%', height: 1, background: 'var(--fr-line)' }} />
            {[
              { n: '01', t: 'Simulez', d: 'Formulaire 5 étapes, autofill SIREN, pré-scoring instantané.', dur: '3 min' },
              { n: '02', t: 'Comparez', d: 'Nous interrogeons 30 partenaires. Vous recevez 3 à 5 offres.', dur: '24-48 h' },
              { n: '03', t: 'Signez', d: 'Signature eIDAS chez nous, sans déplacement. Probante.', dur: '5 min' },
              { n: '04', t: 'Recevez', d: 'Fonds débloqués sur le compte du fournisseur ou directement.', dur: '72 h' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 120}>
                <div style={{ padding: '0 20px', position: 'relative' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--fr-bg)', border: '2px solid var(--fr-ink)', color: 'var(--fr-ink)', display: 'grid', placeItems: 'center', fontFamily: 'var(--fr-serif)', fontSize: 18, position: 'relative', zIndex: 2 }}>{s.n}</div>
                  <div style={{ marginTop: 22, fontSize: 22, fontFamily: 'var(--fr-serif)', letterSpacing: '-0.02em', color: 'var(--fr-ink)' }}>{s.t}</div>
                  <div style={{ marginTop: 10, fontSize: 13.5, color: 'var(--fr-text-muted)', lineHeight: 1.55 }}>{s.d}</div>
                  <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fr-accent-deep)', fontWeight: 600, padding: '4px 10px', background: 'var(--fr-accent-soft)', borderRadius: 999 }}>
                    ⏱ {s.dur}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{ background: 'var(--fr-ink)', padding: '140px 80px', position: 'relative', overflow: 'hidden', color: 'white' }}>
        <Halo color="var(--fr-accent)" size={520} opacity={0.20} top={-100} left={'30%'} blur={120} />
        <div style={{ position: 'relative', maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: 48, fontFamily: 'var(--fr-serif)', color: 'var(--fr-accent)', lineHeight: 1 }}>"</div>
            <p className="fr-serif" style={{ fontSize: 36, lineHeight: 1.25, letterSpacing: '-0.015em', marginTop: 0, color: 'white' }}>
              On a financé une ligne de production de 340 k€ en 5 jours. Trois banques en parallèle, une seule signature électronique. Notre DAF a gagné un mois.
            </p>
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
              <div className="fr-avatar" style={{ background: 'var(--fr-accent)', color: 'var(--fr-ink)' }}>MC</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Marc Cottin</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>CEO · Cottin Industries (BTP, 42 salariés)</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section style={{ background: 'var(--fr-bg)', padding: '120px 80px 60px', position: 'relative' }}>
        <div className="fr-card" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40, position: 'relative', overflow: 'hidden' }}>
          <Halo color="var(--fr-accent)" size={300} opacity={0.18} top={-100} right={-60} blur={80} />
          <div style={{ position: 'relative' }}>
            <h2 className="fr-h2 fr-serif" style={{ maxWidth: 480 }}>Prêt à financer votre prochain investissement ?</h2>
            <p className="fr-body" style={{ marginTop: 14, maxWidth: 420 }}>Simulation gratuite, sans engagement. Réponse de principe en 4 h.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
            <a href="#" className="fr-btn fr-btn-primary">Démarrer une simulation →</a>
            <a href="#" className="fr-btn fr-btn-ghost">Prendre rendez-vous</a>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 80, paddingTop: 50, borderTop: '1px solid var(--fr-line)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <FinarentLogo />
            <p style={{ fontSize: 12.5, color: 'var(--fr-text-muted)', marginTop: 16, maxWidth: 280, lineHeight: 1.6 }}>
              Courtier en financement et assurance professionnels. ORIAS 23 004 891. COBSP + COA.
            </p>
          </div>
          {[
            { t: 'Produits', l: ['Crédit-bail', 'LOA', 'LLD', 'Prêt pro', 'RC Pro'] },
            { t: 'Société', l: ['À propos', 'Carrières', 'Presse', 'Contact'] },
            { t: 'Ressources', l: ['Blog', 'FAQ', 'Glossaire', 'Simulateur'] },
            { t: 'Légal', l: ['Mentions', 'CGU', 'Privacy', 'Cookies'] },
          ].map((c, i) => (
            <div key={i}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fr-ink)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.t}</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {c.l.map(l => <a key={l} href="#" style={{ fontSize: 13, color: 'var(--fr-text-muted)', textDecoration: 'none' }}>{l}</a>)}
              </div>
            </div>
          ))}
        </footer>
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--fr-line)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--fr-text-soft)' }}>
          <span>© 2026 Finarent. Tous droits réservés.</span>
          <span>contact@finarent.fr · 01 84 80 99 99</span>
        </div>
      </section>
    </div>
  );
}

/* === SOLUTIONS index === */
function PageSolutions() {
  const solutions = [
    { n: 'Crédit-bail mobilier', d: 'Financez vos équipements professionnels. TVA récupérable mensuellement, charges déductibles 100%.', dur: '24 à 84 mois', amt: '5 k€ — 5 M€', icon: 'CB' },
    { n: 'LOA · Location avec option d\'achat', d: 'Idéal pour véhicules et matériel. Option d\'achat finale à un prix fixé.', dur: '12 à 60 mois', amt: '5 k€ — 250 k€', icon: 'LOA' },
    { n: 'LLD · Location longue durée', d: 'Loyers fixes, services inclus. Pas de remise sur bilan, hors actif.', dur: '24 à 60 mois', amt: '15 k€ — 1 M€', icon: 'LLD' },
    { n: 'Prêt professionnel', d: 'Trésorerie, croissance, acquisition. Taux fixes ou variables selon profil.', dur: '12 à 84 mois', amt: '10 k€ — 3 M€', icon: 'PRO' },
    { n: 'Leasing opérationnel', d: 'Pour parcs IT, mobilier, télécoms. Maintenance + renouvellement intégrés.', dur: '24 à 48 mois', amt: '20 k€ — 2 M€', icon: 'OPS' },
    { n: 'RC Pro & assurances', d: 'Responsabilité civile, multirisque, cyber. Devis comparatif 4 assureurs.', dur: 'Annuel', amt: 'À partir de 35 €/mois', icon: 'RC' },
  ];
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)', position: 'relative' }}>
      <PublicHeader />
      <section style={{ position: 'relative', padding: '60px 80px 40px' }}>
        <AmbientBg variant="warm" />
        <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative' }}>
          <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Nos solutions</span>
          <h1 className="fr-h1 fr-serif" style={{ marginTop: 18, maxWidth: 820 }}>
            6 produits. <em style={{ color: 'var(--fr-accent-deep)' }}>Une seule</em> demande.
          </h1>
          <p className="fr-body-lg" style={{ marginTop: 22, maxWidth: 580 }}>
            Chaque solution est étudiée par 5 partenaires en parallèle. Vous comparez en 48 h.
          </p>
        </div>
      </section>
      <section style={{ padding: '40px 80px 120px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {solutions.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="fr-card" style={{ padding: 32, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--fr-ink)', color: 'var(--fr-accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--fr-serif)', fontSize: 20, letterSpacing: '-0.02em' }}>{s.icon}</div>
                  <span style={{ fontSize: 11, color: 'var(--fr-text-soft)', fontFamily: 'var(--fr-mono)' }}>0{i + 1}</span>
                </div>
                <h3 className="fr-h3" style={{ marginTop: 24, fontFamily: 'var(--fr-serif)', fontWeight: 400, fontSize: 26, letterSpacing: '-0.02em' }}>{s.n}</h3>
                <p className="fr-body" style={{ marginTop: 12, fontSize: 14.5 }}>{s.d}</p>
                <div style={{ marginTop: 28, display: 'flex', gap: 24, paddingTop: 18, borderTop: '1px solid var(--fr-line)' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Durée</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{s.dur}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Montant</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{s.amt}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', alignSelf: 'end' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fr-ink)' }}>Découvrir →</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

/* === SECTOR DETAIL (BTP) === */
function PageSectorDetail() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <PublicHeader />
      <section style={{ position: 'relative', padding: '40px 80px 60px', overflow: 'hidden' }}>
        <AmbientBg variant="warm" />
        <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <a href="#" style={{ fontSize: 12, color: 'var(--fr-text-muted)' }}>← Tous les secteurs</a>
            <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)', display: 'block', marginTop: 24 }}>· Secteur BTP & Construction</span>
            <h1 className="fr-h1 fr-serif" style={{ marginTop: 14, fontSize: 60 }}>Engins, échafaudages, utilitaires : <em style={{ color: 'var(--fr-accent-deep)' }}>financés vite.</em></h1>
            <p className="fr-body-lg" style={{ marginTop: 22, maxWidth: 480 }}>342 dossiers BTP financés en 2026. Acceptation 96%. Délai moyen 64 h.</p>
            <div style={{ marginTop: 30, display: 'flex', gap: 12 }}>
              <a href="#" className="fr-btn fr-btn-primary">Simuler un financement BTP</a>
              <a href="#" className="fr-btn fr-btn-ghost">Cas clients (12)</a>
            </div>
          </div>
          <Parallax speed={0.1}>
            <div className="fr-placeholder" style={{ height: 380, borderRadius: 18, position: 'relative' }}>
              <span>{'<image · grue Liebherr en chantier · 4:3 >'}</span>
            </div>
          </Parallax>
        </div>
      </section>
      <section style={{ padding: '60px 80px', background: 'var(--fr-bg-cool)', position: 'relative' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h2 className="fr-h2 fr-serif" style={{ maxWidth: 600 }}>Les équipements <em style={{ color: 'var(--fr-accent-deep)' }}>les plus financés</em>.</h2>
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { n: 'Pelles & mini-pelles', v: '124 dossiers', a: '38 k€ moy.' },
              { n: 'Échafaudages', v: '67 dossiers', a: '22 k€ moy.' },
              { n: 'Camions & utilitaires', v: '88 dossiers', a: '54 k€ moy.' },
              { n: 'Bétonnières & nacelles', v: '63 dossiers', a: '18 k€ moy.' },
            ].map((x, i) => (
              <div key={i} className="fr-card" style={{ padding: 24 }}>
                <div className="fr-placeholder" style={{ height: 100, borderRadius: 8, marginBottom: 16 }}><span style={{ fontSize: 10 }}>{'<photo>'}</span></div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{x.n}</div>
                <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', marginTop: 6 }}>{x.v} · {x.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: '80px', background: 'var(--fr-bg)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h2 className="fr-h2 fr-serif">Cas clients récents</h2>
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { c: 'Cottin Industries', a: '340 000 €', d: 'Pelle Liebherr R 920', t: '5 j' },
              { c: 'BTP Frères Audouin', a: '125 000 €', d: 'Flotte 4 utilitaires Renault', t: '3 j' },
              { c: 'Maçonnerie Lefèvre', a: '78 000 €', d: 'Échafaudage modulaire', t: '4 j' },
            ].map((x, i) => (
              <div key={i} className="fr-card" style={{ padding: 28 }}>
                <span className="fr-pill fr-pill-ok">Signé · {x.t}</span>
                <div className="fr-serif" style={{ fontSize: 28, marginTop: 18, letterSpacing: '-0.02em' }}>{x.a}</div>
                <div style={{ fontSize: 13, color: 'var(--fr-text-muted)', marginTop: 8 }}>{x.d}</div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--fr-line)', fontSize: 12.5, fontWeight: 600 }}>{x.c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* === SIMULATOR === */
function PageSimulator() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <PublicHeader />
      <section style={{ padding: '40px 80px 80px', position: 'relative' }}>
        <AmbientBg variant="warm" />
        <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative' }}>
          <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>· Simulateur</span>
          <h1 className="fr-h1 fr-serif" style={{ marginTop: 18 }}>Simulez votre <em style={{ color: 'var(--fr-accent-deep)' }}>mensualité</em>.</h1>
          <p className="fr-body-lg" style={{ marginTop: 18, maxWidth: 560 }}>Calcul instantané sur 30 partenaires. Sans engagement.</p>

          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
            <div className="fr-card" style={{ padding: 36 }}>
              {[
                { l: 'Type de financement', v: ['Crédit-bail', 'LOA', 'LLD', 'Prêt pro'], sel: 0 },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{s.l}</div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    {s.v.map((o, j) => <span key={j} className="fr-tag" style={{ background: j === s.sel ? 'var(--fr-ink)' : 'white', color: j === s.sel ? 'white' : 'var(--fr-text)', borderColor: j === s.sel ? 'var(--fr-ink)' : 'var(--fr-line-cool)' }}>{o}</span>)}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--fr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Montant à financer</span>
                  <span className="fr-serif" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>85 000 €</span>
                </div>
                <div style={{ height: 6, background: 'var(--fr-bg-cool)', borderRadius: 6, position: 'relative' }}>
                  <div style={{ width: '38%', height: '100%', background: 'var(--fr-ink)', borderRadius: 6 }} />
                  <div style={{ position: 'absolute', left: '38%', top: -7, width: 20, height: 20, borderRadius: '50%', background: 'white', border: '3px solid var(--fr-ink)', transform: 'translateX(-50%)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--fr-text-soft)' }}>
                  <span>5 k€</span><span>5 M€</span>
                </div>
              </div>
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 12 }}>Durée</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[24, 36, 48, 60, 72].map((d, i) => <span key={i} className="fr-tag" style={{ background: i === 2 ? 'var(--fr-accent)' : 'white', color: i === 2 ? 'var(--fr-ink)' : 'var(--fr-text)', borderColor: i === 2 ? 'var(--fr-accent)' : 'var(--fr-line-cool)' }}>{d} mois</span>)}
                </div>
              </div>
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--fr-line)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Apport</div>
                  <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>0 €</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Valeur résiduelle</div>
                  <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>5%</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--fr-ink)', color: 'white', padding: 36, borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
              <Halo color="var(--fr-accent)" size={300} opacity={0.3} top={-80} right={-60} blur={80} />
              <div style={{ position: 'relative' }}>
                <div className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Estimation indicative</div>
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Mensualité HT</div>
                  <div className="fr-serif" style={{ fontSize: 64, color: 'var(--fr-accent)', letterSpacing: '-0.025em', lineHeight: 1, marginTop: 6 }}>2 487 €</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>≈ 2 984 € TTC</div>
                </div>
                <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Coût total</div><div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>119 376 €</div></div>
                  <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Taux moyen</div><div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>4.82%</div></div>
                  <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>TVA déductible</div><div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>19 896 €</div></div>
                  <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Économie IS</div><div style={{ fontSize: 16, fontWeight: 600, marginTop: 4, color: 'var(--fr-accent)' }}>11 230 €</div></div>
                </div>
                <a href="#" className="fr-btn fr-btn-accent" style={{ marginTop: 28, width: '100%', justifyContent: 'center' }}>Lancer ma demande →</a>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12, textAlign: 'center' }}>Réponse de principe en 4 h ouvrées</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { PageHome, PageSolutions, PageSectorDetail, PageSimulator });
