/* Admin / Partner / Insurer dashboards — Finarent refresh */

function AdminShell({ active, children }) {
  const items = [
    { i: '◐', l: 'Dashboard' },
    { i: '☰', l: 'Demandes' },
    { i: '⊞', l: 'Kanban' },
    { i: '⊕', l: 'Offres' },
    { i: '◉', l: 'Utilisateurs' },
    { i: '◇', l: 'Partenaires' },
    { i: '✦', l: 'Témoignages' },
    { i: '?', l: 'FAQ' },
    { i: '⚙', l: 'Réglages' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '240px 1fr', background: 'var(--fr-bg)' }}>
      <aside style={{ background: 'var(--fr-ink)', color: 'white', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 8px 24px' }}><FinarentLogo color="white" size={22} /></div>
        <div style={{ padding: '0 8px', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 10 }}>Admin · v3.2</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
              fontSize: 13.5, cursor: 'pointer',
              background: active === it.l ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: active === it.l ? 'white' : 'rgba(255,255,255,0.65)',
            }}>
              <span style={{ width: 18, color: active === it.l ? 'var(--fr-accent)' : 'rgba(255,255,255,0.5)' }}>{it.i}</span>
              <span>{it.l}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="fr-avatar" style={{ background: 'var(--fr-accent)', color: 'var(--fr-ink)' }}>SM</div>
            <div>
              <div style={{ fontWeight: 600, color: 'white' }}>Sarah Mercier</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Admin</div>
            </div>
          </div>
        </div>
      </aside>
      <div data-scroll-host style={{ overflow: 'auto' }}>{children}</div>
    </div>
  );
}

/* === ADMIN Dashboard === */
function PageAdminDashboard() {
  return (
    <AdminShell active="Dashboard">
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div>
            <span className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>· Vue d'ensemble · 29 avr. 2026</span>
            <h1 className="fr-h2 fr-serif" style={{ marginTop: 6 }}>Bonjour Sarah.</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="#" className="fr-btn fr-btn-ghost">Exporter CSV</a>
            <a href="#" className="fr-btn fr-btn-primary">+ Demande</a>
          </div>
        </div>

        {/* À traiter */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { t: 'PENDING > 4h', v: 7, c: 'danger' },
            { t: 'Docs > 7 j', v: 12, c: 'warn' },
            { t: 'Offres expirent < 24h', v: 4, c: 'warn' },
            { t: 'Sans réponse > 48h', v: 9, c: 'info' },
          ].map((a, i) => (
            <div key={i} className="fr-card" style={{ padding: 18, borderLeft: `3px solid ${a.c === 'danger' ? '#C53030' : a.c === 'warn' ? '#D97706' : 'var(--fr-indigo)'}` }}>
              <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{a.t}</div>
              <div className="fr-serif" style={{ fontSize: 36, marginTop: 6 }}>{a.v}</div>
              <a href="#" style={{ fontSize: 12, color: 'var(--fr-ink)', fontWeight: 600 }}>Traiter →</a>
            </div>
          ))}
        </div>

        {/* KPI row */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {[
            { l: 'Volume mois', v: '38.4 M€', d: '+12%' },
            { l: 'Dossiers', v: '124', d: '+8' },
            { l: 'Conversion', v: '42%', d: '+3 pts' },
            { l: 'Délai trait.', v: '64 h', d: '-6h' },
            { l: 'Délai sign.', v: '2.4 j', d: '-12%' },
            { l: 'Abandon', v: '11%', d: '-2 pts' },
          ].map((k, i) => (
            <div key={i} className="fr-kpi" style={{ padding: 14 }}>
              <div className="fr-kpi-label" style={{ fontSize: 10 }}>{k.l}</div>
              <div className="fr-kpi-value" style={{ fontSize: 26 }}>{k.v}</div>
              <div className="fr-kpi-delta" style={{ fontSize: 11 }}>{k.d}</div>
            </div>
          ))}
        </div>

        {/* Funnel + SLA */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          <div className="fr-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Funnel conversion · 6 étapes</h3>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Pending', v: 312, p: 100, drop: null },
                { l: 'Reviewing', v: 268, p: 86, drop: '-14%' },
                { l: 'Documents', v: 234, p: 75, drop: '-13%' },
                { l: 'Quote sent', v: 198, p: 63, drop: '-15%' },
                { l: 'Signed', v: 142, p: 46, drop: '-28%' },
                { l: 'Completed', v: 131, p: 42, drop: '-8%' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 90, fontSize: 13, color: 'var(--fr-text-muted)' }}>{s.l}</div>
                  <div style={{ flex: 1, height: 28, background: 'var(--fr-bg-cool)', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: `${s.p}%`, height: '100%', background: `oklch(${0.4 + i * 0.05} 0.1 ${190 + i * 8})`, borderRadius: 6, display: 'flex', alignItems: 'center', padding: '0 12px', color: 'white', fontSize: 12, fontWeight: 600 }}>{s.v}</div>
                  </div>
                  <div style={{ width: 60, textAlign: 'right', fontSize: 12, color: s.drop ? '#C53030' : 'var(--fr-text-soft)' }}>{s.drop || '—'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fr-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Alertes SLA</h3>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'L1 · 4h', n: 3, c: '#FFB020' },
                { l: 'L2 · 24h', n: 5, c: '#D97706' },
                { l: 'L3 · 48h', n: 2, c: '#C53030' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--fr-bg-cool)', borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.c }} />
                  <div style={{ flex: 1, fontSize: 13 }}>{s.l}</div>
                  <div style={{ fontSize: 22, fontFamily: 'var(--fr-serif)' }}>{s.n}</div>
                </div>
              ))}
            </div>
            <h4 style={{ marginTop: 28, fontSize: 13, fontWeight: 600 }}>Top 5 opérateurs</h4>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['JD', 'Julien Daudet', 87], ['MC', 'Maya Chen', 82], ['AT', 'Aymeric Tran', 76], ['LB', 'Lou Berger', 71], ['NM', 'Nadia Marc', 68]].map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="fr-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{o[0]}</div>
                  <div style={{ flex: 1, fontSize: 12 }}>{o[1]}</div>
                  <div style={{ width: 80, height: 4, background: 'var(--fr-bg-cool)', borderRadius: 4 }}>
                    <div style={{ width: `${o[2]}%`, height: '100%', background: 'var(--fr-accent)', borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 30, textAlign: 'right', fontSize: 11, color: 'var(--fr-text-muted)' }}>{o[2]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent applications */}
        <div className="fr-card" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--fr-line-cool)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Demandes récentes</h3>
            <a href="#" style={{ fontSize: 13, color: 'var(--fr-ink)', fontWeight: 600 }}>Voir tout →</a>
          </div>
          <table className="fr-table">
            <thead><tr><th>ID</th><th>Client</th><th>Produit</th><th>Montant</th><th>Score</th><th>Statut</th><th>Opérateur</th><th>Mis à jour</th></tr></thead>
            <tbody>
              {[
                ['FA-2847', 'Régis Construction SAS', 'Crédit-bail', '340 000 €', 87, 'Étude', 'info', 'JD', '5 min'],
                ['FA-2846', 'Studio Lumière SARL', 'LOA', '24 000 €', 72, 'Offre envoyée', 'warn', 'MC', '12 min'],
                ['FA-2845', 'Cabinet Mérieux', 'LLD', '88 000 €', 91, 'Signé', 'ok', 'AT', '34 min'],
                ['FA-2844', 'IT Services Pro', 'Crédit-bail', '156 000 €', 64, 'Documents', 'warn', 'LB', '1 h'],
                ['FA-2843', 'Boulangerie Marc', 'LOA', '42 000 €', 45, 'Rejeté', 'danger', 'NM', '2 h'],
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--fr-mono)', fontSize: 11.5 }}>{r[0]}</td>
                  <td style={{ fontWeight: 600 }}>{r[1]}</td>
                  <td style={{ color: 'var(--fr-text-muted)' }}>{r[2]}</td>
                  <td style={{ fontWeight: 600 }}>{r[3]}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 36, height: 4, background: 'var(--fr-bg-cool)', borderRadius: 4 }}>
                        <div style={{ width: `${r[4]}%`, height: '100%', background: r[4] > 70 ? 'var(--fr-accent)' : r[4] > 50 ? '#D97706' : '#C53030', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12 }}>{r[4]}</span>
                    </div>
                  </td>
                  <td><span className={`fr-pill fr-pill-${r[6]}`}>{r[5]}</span></td>
                  <td><div className="fr-avatar" style={{ width: 22, height: 22, fontSize: 9 }}>{r[7]}</div></td>
                  <td style={{ fontSize: 11.5, color: 'var(--fr-text-soft)' }}>il y a {r[8]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

/* === ADMIN Kanban === */
function PageAdminKanban() {
  const cols = [
    { l: 'Pending', c: 'rgba(91, 107, 130, 1)', items: [['FA-2847', 'Régis Construction', '340 k€', 'JD', 87], ['FA-2851', 'Atelier Bois & Co', '52 k€', 'MC', 78]] },
    { l: 'Étude', c: 'var(--fr-indigo)', items: [['FA-2846', 'Studio Lumière', '24 k€', 'MC', 72], ['FA-2844', 'IT Services Pro', '156 k€', 'LB', 64], ['FA-2840', 'Pharma Brindille', '92 k€', 'JD', 88]] },
    { l: 'Offre', c: '#D97706', items: [['FA-2842', 'Cottin Industries', '420 k€', 'AT', 91], ['FA-2839', 'Restaurant Vague', '38 k€', 'NM', 67]] },
    { l: 'Signature', c: 'var(--fr-accent)', items: [['FA-2845', 'Cabinet Mérieux', '88 k€', 'AT', 91], ['FA-2837', 'TX Logistics', '215 k€', 'LB', 84]] },
    { l: 'Fonds', c: 'var(--fr-accent-deep)', items: [['FA-2833', 'Maçonnerie Lefèvre', '78 k€', 'JD', 89]] },
  ];
  return (
    <AdminShell active="Kanban">
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="fr-h2 fr-serif">Kanban dossiers</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="fr-tag">Tous opérateurs</span>
            <span className="fr-tag">Tous secteurs</span>
            <span className="fr-tag">7 derniers jours</span>
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, height: 'calc(100% - 100px)' }}>
          {cols.map((col, i) => (
            <div key={i} style={{ background: 'var(--fr-bg-cool)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.c }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{col.l}</span>
                <span style={{ fontSize: 11, color: 'var(--fr-text-muted)' }}>· {col.items.length}</span>
              </div>
              {col.items.map((it, j) => (
                <div key={j} className="fr-card" style={{ padding: 14, cursor: 'grab' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--fr-text-soft)', fontFamily: 'var(--fr-mono)' }}>{it[0]}</span>
                    <div className="fr-avatar" style={{ width: 20, height: 20, fontSize: 9 }}>{it[3]}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{it[1]}</div>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="fr-serif" style={{ fontSize: 18 }}>{it[2]}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--fr-text-muted)' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: it[4] > 80 ? 'var(--fr-accent)' : '#D97706' }} /> {it[4]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

/* === PARTNER === */
function PagePartner() {
  return (
    <div data-scroll-host style={{ width: '100%', height: '100%', overflow: 'auto', background: 'var(--fr-bg)' }}>
      <div className="fr-nav" style={{ borderBottom: '1px solid var(--fr-line)', background: 'white' }}>
        <FinarentLogo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="fr-tag fr-pill-info">Partenaire · BNP Paribas Lease</span>
          <div className="fr-avatar">PB</div>
        </div>
      </div>
      <div style={{ padding: 32, maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>· Espace partenaire</span>
            <h1 className="fr-h2 fr-serif" style={{ marginTop: 6 }}>14 dossiers à analyser cette semaine.</h1>
          </div>
          <a href="#" className="fr-btn fr-btn-primary">📥 Exporter</a>
        </div>

        <div style={{ marginTop: 24, padding: 18, background: 'var(--fr-ink)', color: 'white', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <Halo color="var(--fr-accent)" size={300} opacity={0.3} top={-100} right={-60} blur={80} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Volume transmis ce mois</div>
            <div className="fr-serif" style={{ fontSize: 56, color: 'white', letterSpacing: '-0.025em', marginTop: 6 }}>4.8 M€</div>
            <div style={{ fontSize: 12, color: 'var(--fr-accent)', marginTop: 4 }}>+18% vs mois dernier · 32 dossiers</div>
          </div>
          <div style={{ position: 'relative', display: 'flex', gap: 24 }}>
            {[['Acceptation', '89%'], ['Délai analyse', '36h'], ['Commission MTD', '38 200 €']].map((x, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{x[0]}</div>
                <div className="fr-serif" style={{ fontSize: 26, color: 'white', marginTop: 4 }}>{x[1]}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          <div className="fr-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Funnel partenaire</h3>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-around', alignItems: 'end', height: 200, gap: 12 }}>
              {[['Transmis', 32, 100], ['Analyse', 28, 88], ['Validés', 22, 69], ['Finalisés', 19, 59]].map((s, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 18, fontFamily: 'var(--fr-serif)' }}>{s[1]}</div>
                  <div style={{ width: '100%', height: `${s[2] * 1.6}px`, background: `oklch(${0.55 + i * 0.06} 0.13 165)`, borderRadius: '8px 8px 0 0' }} />
                  <div style={{ fontSize: 12, color: 'var(--fr-text-muted)' }}>{s[0]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fr-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Mix produits</h3>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['Crédit-bail', 48, 'var(--fr-accent)'], ['LOA', 26, 'var(--fr-indigo)'], ['LLD', 14, '#D97706'], ['Prêt pro', 12, '#5B6B82']].map((p, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                    <span>{p[0]}</span><span style={{ color: 'var(--fr-text-muted)' }}>{p[1]}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--fr-bg-cool)', borderRadius: 4 }}>
                    <div style={{ width: `${p[1]}%`, height: '100%', background: p[2], borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fr-card" style={{ marginTop: 16, padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--fr-line-cool)' }}><h3 style={{ fontSize: 15, fontWeight: 600 }}>Dossiers en attente d'analyse</h3></div>
          <table className="fr-table">
            <thead><tr><th>ID</th><th>Client</th><th>Secteur</th><th>Montant</th><th>Score</th><th>Reçu</th><th></th></tr></thead>
            <tbody>
              {[['FA-2847', 'Régis Construction', 'BTP', '340 k€', 87, '2h'], ['FA-2851', 'Pharma Brindille', 'Médical', '92 k€', 88, '4h'], ['FA-2842', 'Cottin Industries', 'BTP', '420 k€', 91, '6h']].map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--fr-mono)' }}>{r[0]}</td>
                  <td style={{ fontWeight: 600 }}>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td style={{ fontWeight: 600 }}>{r[3]}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 32, height: 4, background: 'var(--fr-bg-cool)', borderRadius: 4 }}><div style={{ width: `${r[4]}%`, height: '100%', background: 'var(--fr-accent)', borderRadius: 4 }} /></div>{r[4]}</div></td>
                  <td style={{ fontSize: 11.5, color: 'var(--fr-text-soft)' }}>il y a {r[5]}</td>
                  <td><a href="#" className="fr-btn fr-btn-primary" style={{ padding: '8px 14px', fontSize: 12 }}>Analyser →</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PageAdminDashboard, PageAdminKanban, PagePartner });
