/* Espace client + Auth screens — Finarent refresh */

function ClientHeader() {
  return (
    <div className="fr-nav" style={{ borderBottom: '1px solid var(--fr-line)', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
      <FinarentLogo />
      <nav style={{ display: 'flex', gap: 4 }}>
        <a href="#" className="fr-nav-link" style={{ background: 'var(--fr-bg-cool)', color: 'var(--fr-ink)' }}>Espace</a>
        <a href="#" className="fr-nav-link">Mes dossiers</a>
        <a href="#" className="fr-nav-link">Documents</a>
        <a href="#" className="fr-nav-link">Parrainage</a>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <span style={{ fontSize: 18, color: 'var(--fr-text-muted)' }}>🔔</span>
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: 'var(--fr-accent)' }} />
        </div>
        <div className="fr-avatar" style={{ background: 'var(--fr-accent)', color: 'var(--fr-ink)' }}>AR</div>
      </div>
    </div>
  );
}

/* === ESPACE CLIENT — Dashboard === */
function PageEspaceDashboard() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <ClientHeader />
      <div style={{ padding: 40, maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div>
            <span className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>· Bonjour, Antoine Régis</span>
            <h1 className="fr-h2 fr-serif" style={{ marginTop: 8 }}>Vous avez <em style={{ color: 'var(--fr-accent-deep)' }}>2 actions</em> à traiter.</h1>
          </div>
          <a href="#" className="fr-btn fr-btn-primary">+ Nouvelle demande</a>
        </div>

        {/* Active file timeline */}
        <div className="fr-card" style={{ marginTop: 32, padding: 28, position: 'relative', overflow: 'hidden' }}>
          <Halo color="var(--fr-accent)" size={260} opacity={0.12} top={-80} left={-60} blur={70} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="fr-pill fr-pill-info">En cours · Étude</span>
                <h3 style={{ fontFamily: 'var(--fr-serif)', fontSize: 26, marginTop: 12, letterSpacing: '-0.02em' }}>Pelle Liebherr R 920 · 340 000 €</h3>
                <div style={{ fontSize: 13, color: 'var(--fr-text-muted)', marginTop: 4 }}>Crédit-bail · 60 mois · Demande #FA-2026-2847</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mensualité estimée</div>
                <div className="fr-serif" style={{ fontSize: 32, marginTop: 4 }}>6 240 €</div>
              </div>
            </div>
            {/* Timeline */}
            <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', position: 'relative', gap: 0 }}>
              <div style={{ position: 'absolute', top: 14, left: '10%', right: '10%', height: 2, background: 'var(--fr-line)' }} />
              <div style={{ position: 'absolute', top: 14, left: '10%', width: '30%', height: 2, background: 'var(--fr-accent)' }} />
              {[
                { l: 'Dépôt', d: '24 avr.', done: true },
                { l: 'Étude', d: 'En cours', done: false, current: true },
                { l: 'Offre', d: '~ 28 avr.', done: false },
                { l: 'Signature', d: '~ 30 avr.', done: false },
                { l: 'Fonds', d: '~ 03 mai', done: false },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', margin: '0 auto',
                    background: s.done ? 'var(--fr-accent)' : s.current ? 'white' : 'white',
                    border: s.current ? '2px solid var(--fr-accent)' : s.done ? 'none' : '2px solid var(--fr-line)',
                    color: s.done ? 'var(--fr-ink)' : 'var(--fr-text-muted)',
                    display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600,
                    boxShadow: s.current ? '0 0 0 6px color-mix(in oklch, var(--fr-accent) 20%, transparent)' : 'none',
                  }}>{s.done ? '✓' : i + 1}</div>
                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: s.current ? 700 : 500, color: s.current ? 'var(--fr-ink)' : 'var(--fr-text-muted)' }}>{s.l}</div>
                  <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', marginTop: 2 }}>{s.d}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, padding: 16, background: 'var(--fr-accent-soft)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fr-accent-deep)' }}>Action requise · Bilan 2025 manquant</div>
                <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', marginTop: 2 }}>Pour finaliser l'étude, votre conseiller a besoin du bilan exercice clos 2025.</div>
              </div>
              <a href="#" className="fr-btn fr-btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>Téléverser →</a>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { l: 'Dossiers actifs', v: 2, d: '1 en étude · 1 en offre' },
            { l: 'Total financé', v: '418 k€', d: 'sur 5 dossiers signés' },
            { l: 'Économies fiscales', v: '32 k€', d: 'estimées sur 12 mois' },
            { l: 'Score de pré-qualif', v: '87/100', d: 'Profil A · excellent' },
          ].map((k, i) => (
            <div key={i} className="fr-kpi">
              <div className="fr-kpi-label">{k.l}</div>
              <div className="fr-kpi-value">{k.v}</div>
              <div className="fr-kpi-delta">{k.d}</div>
            </div>
          ))}
        </div>

        {/* Two columns: dossiers + sidebar */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div className="fr-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--fr-line-cool)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Mes dossiers</h3>
              <div style={{ display: 'flex', gap: 4 }}>
                {['Tous', 'En cours', 'Signés', 'Archivés'].map((t, i) => <span key={i} className="fr-tag" style={{ background: i === 0 ? 'var(--fr-ink)' : 'white', color: i === 0 ? 'white' : 'var(--fr-text)', fontSize: 11.5 }}>{t}</span>)}
              </div>
            </div>
            <table className="fr-table">
              <thead><tr><th>Dossier</th><th>Type</th><th>Montant</th><th>Statut</th><th>Docs</th></tr></thead>
              <tbody>
                {[
                  { id: 'FA-2847', t: 'Pelle Liebherr', p: 'Crédit-bail', a: '340 000 €', s: 'Étude', sc: 'info', d: '4/5' },
                  { id: 'FA-2814', t: 'Flotte 4 utilitaires', p: 'LLD', a: '125 000 €', s: 'Offre reçue', sc: 'warn', d: '5/5' },
                  { id: 'FA-2760', t: 'Échafaudage modulaire', p: 'Crédit-bail', a: '78 000 €', s: 'Signé', sc: 'ok', d: '5/5' },
                  { id: 'FA-2601', t: 'Bétonnière + nacelle', p: 'LOA', a: '45 000 €', s: 'Fonds versés', sc: 'ok', d: '5/5' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td><div style={{ fontWeight: 600 }}>{r.t}</div><div style={{ fontSize: 11, color: 'var(--fr-text-soft)', fontFamily: 'var(--fr-mono)' }}>{r.id}</div></td>
                    <td style={{ color: 'var(--fr-text-muted)' }}>{r.p}</td>
                    <td style={{ fontWeight: 600 }}>{r.a}</td>
                    <td><span className={`fr-pill fr-pill-${r.sc}`}>{r.s}</span></td>
                    <td><div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <div style={{ width: 60, height: 4, background: 'var(--fr-bg-cool)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(parseInt(r.d) / 5) * 100}%`, height: '100%', background: 'var(--fr-accent)' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--fr-text-muted)' }}>{r.d}</span>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Advisor */}
            <div className="fr-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>Votre conseiller</div>
              <div style={{ marginTop: 14, display: 'flex', gap: 14 }}>
                <div className="fr-avatar" style={{ width: 52, height: 52, fontSize: 16, background: 'var(--fr-ink)' }}>JD</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Julien Daudet</div>
                  <div style={{ fontSize: 12, color: 'var(--fr-text-muted)' }}>Conseiller BTP · 7 ans</div>
                </div>
              </div>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" className="fr-btn fr-btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '10px 14px', fontSize: 13 }}>📞 Appeler</a>
                <a href="#" className="fr-btn fr-btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '10px 14px', fontSize: 13 }}>✉ Message</a>
              </div>
            </div>
            {/* Profile completion */}
            <div className="fr-card" style={{ padding: 24 }}>
              <div className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>Profil entreprise</div>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="fr-serif" style={{ fontSize: 28 }}>92%</div>
                <span style={{ fontSize: 12, color: 'var(--fr-accent-deep)', fontWeight: 600 }}>Excellent</span>
              </div>
              <div style={{ marginTop: 8, height: 4, background: 'var(--fr-bg-cool)', borderRadius: 4 }}>
                <div style={{ width: '92%', height: '100%', background: 'var(--fr-accent)', borderRadius: 4 }} />
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: 'var(--fr-text-muted)' }}>Ajoutez votre IBAN pour atteindre 100%.</div>
            </div>
            {/* Activity */}
            <div className="fr-card" style={{ padding: 24 }}>
              <div className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>Activité récente</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { t: 'Bilan 2024 reçu', d: 'il y a 2 h' },
                  { t: 'Conseiller a commenté #2847', d: 'il y a 5 h' },
                  { t: 'Offre BNP envoyée', d: 'hier' },
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fr-accent)', marginTop: 6, flexShrink: 0 }} />
                    <div><div>{a.t}</div><div style={{ color: 'var(--fr-text-soft)', fontSize: 11 }}>{a.d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* === DOSSIER DETAIL === */
function PageDossierDetail() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <ClientHeader />
      <div style={{ padding: 40, maxWidth: 1280, margin: '0 auto' }}>
        <a href="#" style={{ fontSize: 12, color: 'var(--fr-text-muted)' }}>← Mes dossiers</a>
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <span className="fr-pill fr-pill-info">En étude</span>
            <h1 className="fr-h2 fr-serif" style={{ marginTop: 12, letterSpacing: '-0.02em' }}>Pelle Liebherr R 920</h1>
            <div style={{ fontSize: 13, color: 'var(--fr-text-muted)', marginTop: 6, fontFamily: 'var(--fr-mono)' }}>FA-2026-2847 · Crédit-bail · 60 mois · 340 000 €</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="#" className="fr-btn fr-btn-ghost">📄 Télécharger PDF</a>
            <a href="#" className="fr-btn fr-btn-primary">Contacter conseiller</a>
          </div>
        </div>

        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Documents */}
          <div className="fr-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Documents</h3>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { n: 'KBIS', s: 'kbis_2026.pdf · 247 KB', ok: true },
                { n: 'RIB', s: 'rib_credit_agricole.pdf · 78 KB', ok: true },
                { n: 'CNI dirigeant', s: 'cni_recto_verso.pdf · 1.2 MB', ok: true },
                { n: 'Bilan 2024', s: 'bilan_24.pdf · 892 KB', ok: true },
                { n: 'Bilan 2025', s: 'À téléverser', ok: false },
              ].map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: d.ok ? 'var(--fr-bg-cool)' : 'var(--fr-accent-soft)', borderRadius: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'white', display: 'grid', placeItems: 'center', fontSize: 14 }}>{d.ok ? '✓' : '↑'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{d.n}</div>
                    <div style={{ fontSize: 11, color: 'var(--fr-text-muted)' }}>{d.s}</div>
                  </div>
                  {d.ok ? <span style={{ fontSize: 11, color: 'var(--fr-accent-deep)' }}>Reçu</span> : <a href="#" style={{ fontSize: 12, fontWeight: 600, color: 'var(--fr-ink)' }}>Téléverser →</a>}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="fr-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Messagerie</h3>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="fr-avatar" style={{ width: 28, height: 28, fontSize: 10, background: 'var(--fr-ink)' }}>JD</div>
                <div style={{ background: 'var(--fr-bg-cool)', padding: 12, borderRadius: 10, fontSize: 13, maxWidth: '78%' }}>
                  <div>Bonjour Antoine, j'ai bien reçu votre demande. Pourriez-vous me transmettre votre bilan 2025 pour finaliser l'étude ?</div>
                  <div style={{ fontSize: 10, color: 'var(--fr-text-soft)', marginTop: 6 }}>Julien · il y a 5 h</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <div style={{ background: 'var(--fr-ink)', color: 'white', padding: 12, borderRadius: 10, fontSize: 13, maxWidth: '78%' }}>
                  <div>Bonjour Julien, je l'envoie d'ici demain matin. Notre comptable boucle aujourd'hui.</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Vous · il y a 4 h</div>
                </div>
                <div className="fr-avatar" style={{ width: 28, height: 28, fontSize: 10, background: 'var(--fr-accent)', color: 'var(--fr-ink)' }}>AR</div>
              </div>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--fr-line)', display: 'flex', gap: 10 }}>
              <input placeholder="Écrire un message…" style={{ flex: 1, padding: 12, border: '1px solid var(--fr-line-cool)', borderRadius: 10, fontSize: 13, fontFamily: 'inherit' }} />
              <a href="#" className="fr-btn fr-btn-primary" style={{ padding: '10px 16px' }}>Envoyer</a>
            </div>
          </div>
        </div>

        {/* Offers */}
        <div className="fr-card" style={{ marginTop: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Offres reçues · 3 partenaires</h3>
            <span style={{ fontSize: 12, color: 'var(--fr-text-muted)' }}>Mises à jour il y a 18 min</span>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { p: 'BNP Paribas Lease', m: '6 240 €', t: '4.78%', c: '34 400 €', best: true },
              { p: 'CIC Leasing', m: '6 318 €', t: '4.92%', c: '39 080 €', best: false },
              { p: 'Société Générale', m: '6 405 €', t: '5.08%', c: '44 300 €', best: false },
            ].map((o, i) => (
              <div key={i} style={{ padding: 18, border: o.best ? '2px solid var(--fr-accent)' : '1px solid var(--fr-line-cool)', borderRadius: 12, background: o.best ? 'var(--fr-accent-soft)' : 'white', position: 'relative' }}>
                {o.best && <span style={{ position: 'absolute', top: -10, left: 14, padding: '3px 10px', background: 'var(--fr-accent)', color: 'var(--fr-ink)', fontSize: 10, fontWeight: 700, borderRadius: 999 }}>RECOMMANDÉ</span>}
                <div style={{ fontSize: 13, fontWeight: 600 }}>{o.p}</div>
                <div className="fr-serif" style={{ fontSize: 32, marginTop: 12, letterSpacing: '-0.02em' }}>{o.m}</div>
                <div style={{ fontSize: 11, color: 'var(--fr-text-muted)' }}>/ mois HT</div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--fr-line)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Taux <strong>{o.t}</strong></span><span>Coût <strong>{o.c}</strong></span>
                </div>
                <a href="#" className="fr-btn fr-btn-primary" style={{ marginTop: 14, width: '100%', justifyContent: 'center', padding: '10px 14px', fontSize: 13 }}>Choisir cette offre</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* === PROFILE === */
function PageProfile() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <ClientHeader />
      <div style={{ padding: 40, maxWidth: 1100, margin: '0 auto' }}>
        <h1 className="fr-h2 fr-serif">Mon profil</h1>
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['Profil', 'Entreprise', 'Sécurité', 'Notifications', 'Facturation', 'RGPD'].map((t, i) => (
              <div key={i} className={`fr-sidebar-item ${i === 1 ? 'active' : ''}`}>{t}</div>
            ))}
          </div>
          <div className="fr-card" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Informations entreprise</h3>
            <p style={{ fontSize: 13, color: 'var(--fr-text-muted)', marginTop: 6 }}>Ces infos sont synchronisées via SIREN.</p>

            <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { l: 'Raison sociale', v: 'Régis Construction SAS' },
                { l: 'SIREN', v: '892 471 058' },
                { l: 'Forme juridique', v: 'SAS' },
                { l: 'Code NAF', v: '4120A · Construction' },
                { l: 'Date de création', v: '12 mars 2018' },
                { l: 'Effectif', v: '24 salariés' },
                { l: 'CA dernier exercice', v: '4.2 M€' },
                { l: 'Capital social', v: '200 000 €' },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{f.l}</div>
                  <div style={{ marginTop: 6, padding: '12px 14px', background: 'var(--fr-bg-cool)', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>{f.v}</div>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 36 }}>Adresse du siège</h4>
            <div style={{ marginTop: 12, padding: 16, background: 'var(--fr-bg-cool)', borderRadius: 10, fontSize: 14 }}>
              42 rue des Compagnons<br />75019 Paris, France
            </div>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--fr-line)', display: 'flex', justifyContent: 'space-between' }}>
              <a href="#" className="fr-btn fr-btn-ghost">Annuler</a>
              <a href="#" className="fr-btn fr-btn-primary">Sauvegarder</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* === LOGIN === */
function PageLogin() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'hidden', background: 'var(--fr-bg-deep)', position: 'relative', color: 'white', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div className="fr-aurora fr-grain fr-grain-dark" style={{ position: 'absolute', inset: 0 }} />
      <MouseParallax depth={20} style={{ position: 'absolute', inset: 0 }}>
        <Halo color="var(--fr-accent)" size={500} opacity={0.4} top={-80} left={-80} blur={120} />
        <Halo color="var(--fr-indigo)" size={420} opacity={0.32} bottom={-100} right={-80} blur={120} />
      </MouseParallax>

      <div style={{ position: 'relative', padding: '40px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <FinarentLogo color="white" />
        <div>
          <span className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>· Espace pro</span>
          <h2 className="fr-h2 fr-serif" style={{ marginTop: 14, fontSize: 56, color: 'white' }}>
            Suivez vos dossiers,<br /><em style={{ color: 'var(--fr-accent)' }}>en temps réel.</em>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginTop: 18, maxWidth: 380 }}>
            Timeline, offres comparatives, signature eIDAS, messagerie. Tout est là.
          </p>
          <div style={{ marginTop: 40, display: 'flex', gap: 20 }}>
            {[{ v: '94%', l: 'Acceptation' }, { v: '72h', l: 'Délai offre' }, { v: '2.8k', l: 'Entreprises' }].map((s, i) => (
              <div key={i}>
                <div className="fr-serif" style={{ fontSize: 32, color: 'var(--fr-accent)' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>© 2026 Finarent · ORIAS 23 004 891</div>
      </div>

      <div style={{ position: 'relative', display: 'grid', placeItems: 'center', padding: 40 }}>
        <div className="fr-glass-dark" style={{ padding: 44, borderRadius: 18, width: 420 }}>
          <h3 style={{ fontSize: 24, fontFamily: 'var(--fr-serif)', letterSpacing: '-0.02em' }}>Connexion</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>Accédez à votre espace.</p>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
              <input placeholder="vous@entreprise.fr" style={{ width: '100%', marginTop: 6, padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mot de passe</label>
              <input type="password" placeholder="••••••••" style={{ width: '100%', marginTop: 6, padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 14 }} />
            </div>
          </div>
          <a href="#" className="fr-btn fr-btn-accent" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}>Se connecter →</a>
          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Mot de passe oublié</a> · <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Créer un compte</a>
          </div>
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            🔒 Connexion sécurisée Auth0
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PageEspaceDashboard, PageDossierDetail, PageProfile, PageLogin });
