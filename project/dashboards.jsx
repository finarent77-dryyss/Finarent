/* global React */
const { useState: useStateD } = React;

// ---------- Dashboard 1 — Clean editorial ----------
const DashboardEditorial = () => {
  return (
    <div style={{ background: 'var(--fr-bg)', minHeight: 800, fontFamily: 'var(--fr-sans)' }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px', borderBottom: '1px solid var(--fr-line)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7, background: 'var(--fr-ink)',
            display: 'grid', placeItems: 'center', color: 'white',
            fontFamily: 'var(--fr-serif)', fontSize: 16, fontWeight: 500
          }}>F</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--fr-ink)' }}>Finarent</span>
          <span style={{ marginLeft: 16, fontSize: 13, color: 'var(--fr-text-muted)' }}>· Espace client</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--fr-text-muted)' }}>SARL Atelier Méca · 53891245100012</span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--fr-ink-soft)' }} />
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px' }}>
        {/* Welcome */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>Mardi 28 avril</div>
            <h1 className="fr-h2 fr-serif" style={{ margin: '8px 0 0', color: 'var(--fr-ink)', fontWeight: 400 }}>
              Bonjour Marc.
            </h1>
            <p className="fr-body" style={{ marginTop: 8 }}>
              Votre dossier <strong style={{ color: 'var(--fr-ink)' }}>#FNT-2841</strong> attend la signature électronique.
            </p>
          </div>
          <button className="fr-btn fr-btn-primary">Nouveau dossier +</button>
        </div>

        {/* Active file timeline — hero of the page */}
        <div style={{
          background: 'white', borderRadius: 'var(--fr-r-xl)',
          border: '1px solid var(--fr-line-cool)', padding: 32, marginBottom: 32
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>Dossier en cours · #FNT-2841</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--fr-ink)', marginTop: 8, letterSpacing: '-0.02em' }}>
                Crédit-bail · Centre d'usinage CNC
              </div>
              <div style={{ fontSize: 14, color: 'var(--fr-text-muted)', marginTop: 4 }}>
                85 000 € · 60 mois · BNP Leasing
              </div>
            </div>
            <div style={{
              padding: '8px 14px', background: 'var(--fr-accent-soft)',
              borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'var(--fr-accent-deep)'
            }}>
              ● En attente signature
            </div>
          </div>

          {/* 5-step timeline */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, position: 'relative', marginBottom: 24 }}>
            {[
              { l: 'Dépôt', d: '22 avr', done: true },
              { l: 'Étude', d: '24 avr', done: true },
              { l: 'Offre reçue', d: '26 avr', done: true },
              { l: 'Signature', d: 'En cours', current: true },
              { l: 'Versement', d: '— prévu 02 mai', done: false }
            ].map((s, i) => (
              <div key={i} style={{ position: 'relative', textAlign: 'center' }}>
                {i < 4 && (
                  <div style={{
                    position: 'absolute', top: 11, left: '50%', right: '-50%', height: 2,
                    background: s.done ? 'var(--fr-ink)' : 'var(--fr-line)'
                  }} />
                )}
                <div style={{
                  position: 'relative', width: 22, height: 22, borderRadius: '50%',
                  background: s.done ? 'var(--fr-ink)' : s.current ? 'white' : 'white',
                  border: `2px solid ${s.done || s.current ? 'var(--fr-ink)' : 'var(--fr-line)'}`,
                  margin: '0 auto', display: 'grid', placeItems: 'center', zIndex: 1
                }}>
                  {s.done && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
                  {s.current && <span className="fr-live-dot" style={{ width: 8, height: 8 }} />}
                </div>
                <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: s.done || s.current ? 'var(--fr-ink)' : 'var(--fr-text-soft)' }}>{s.l}</div>
                <div style={{ fontSize: 11, color: 'var(--fr-text-muted)', marginTop: 2 }}>{s.d}</div>
              </div>
            ))}
          </div>

          {/* Next action callout */}
          <div style={{
            marginTop: 16, padding: 20, background: 'var(--fr-bg)',
            borderRadius: 'var(--fr-r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fr-ink)' }}>Prochaine action</div>
              <div style={{ fontSize: 13, color: 'var(--fr-text-muted)', marginTop: 2 }}>Signer le contrat eIDAS · expire dans 4 jours</div>
            </div>
            <button className="fr-btn fr-btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>Signer →</button>
          </div>
        </div>

        {/* Two columns: KPI + activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {[
              { l: 'Économie fiscale estimée', v: '12 480 €', s: 'IS sur 60 mois · ~33%', accent: true },
              { l: 'Trésorerie préservée', v: '85 000 €', s: 'vs achat comptant' },
              { l: 'Mensualité', v: '1 542 €', s: 'TTC · prélèvement le 5' },
              { l: 'Coût total financement', v: '92 520 €', s: 'Intérêts inclus' },
            ].map((k, i) => (
              <div key={i} style={{
                background: k.accent ? 'var(--fr-ink)' : 'white',
                color: k.accent ? 'white' : 'var(--fr-ink)',
                padding: 24, borderRadius: 'var(--fr-r-lg)',
                border: k.accent ? 'none' : '1px solid var(--fr-line-cool)'
              }}>
                <div className="fr-eyebrow" style={{ color: k.accent ? 'rgba(255,255,255,0.6)' : 'var(--fr-text-muted)' }}>{k.l}</div>
                <div className="fr-tnum fr-serif" style={{ fontSize: 36, fontWeight: 400, marginTop: 12, letterSpacing: '-0.02em', color: k.accent ? 'var(--fr-accent)' : 'var(--fr-ink)' }}>{k.v}</div>
                <div style={{ fontSize: 12, marginTop: 4, color: k.accent ? 'rgba(255,255,255,0.6)' : 'var(--fr-text-muted)' }}>{k.s}</div>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div style={{ background: 'white', borderRadius: 'var(--fr-r-xl)', border: '1px solid var(--fr-line-cool)', padding: 24 }}>
            <div className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)', marginBottom: 20 }}>Activité récente</div>
            {[
              { d: '14:32', t: 'Sophie M. (BNP) a envoyé le contrat', tag: 'OFFRE' },
              { d: '11:08', t: 'Pré-scoring validé · 87/100', tag: 'SCORING' },
              { d: 'Hier', t: 'KBIS et bilan 2024 reçus', tag: 'DOCS' },
              { d: '24 avr', t: 'Dossier transmis à 3 partenaires', tag: 'TRANSMIS' },
              { d: '22 avr', t: 'Demande déposée par Marc L.', tag: 'DÉPÔT' },
            ].map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '14px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--fr-line)'
              }}>
                <div style={{ fontSize: 11, color: 'var(--fr-text-soft)', width: 48, paddingTop: 2, fontFamily: 'var(--fr-mono)' }}>{a.d}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--fr-ink)' }}>{a.t}</div>
                  <div className="fr-eyebrow" style={{ color: 'var(--fr-text-soft)', marginTop: 2, fontSize: 9 }}>{a.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Dashboard 2 — Data-dense investor style ----------
const DashboardData = () => (
  <div style={{ background: 'var(--fr-bg-cool)', minHeight: 800, fontFamily: 'var(--fr-sans)' }}>
    {/* Top bar */}
    <div style={{
      padding: '14px 24px', background: 'var(--fr-ink)', color: 'white',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ fontWeight: 600 }}>FINARENT · ADMIN</span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
        {['Dossiers', 'Kanban', 'Partenaires', 'Utilisateurs', 'Logs'].map((i, k) => (
          <span key={i} style={{ color: k === 0 ? 'var(--fr-accent)' : 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>{i}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: 'rgba(255,255,255,0.65)' }}>
        <span className="fr-mono" style={{ fontSize: 11 }}>14:32:08 · 28 avril 26</span>
        <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
      </div>
    </div>

    <div style={{ padding: 24 }}>
      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, background: 'var(--fr-line-cool)', borderRadius: 'var(--fr-r-lg)', overflow: 'hidden', marginBottom: 24 }}>
        {[
          { l: 'Dossiers ouverts', v: '142', d: '+12' },
          { l: 'Volume avril', v: '8,4M€', d: '+18%' },
          { l: 'Taux conversion', v: '64%', d: '+2pts' },
          { l: 'Délai moyen', v: '38h', d: '−4h' },
          { l: 'Mensualité moy.', v: '2 140€', d: '+3%' },
          { l: 'SLA respecté', v: '96%', d: '−1pt', neg: true },
        ].map((k, i) => (
          <div key={i} style={{ background: 'white', padding: 18 }}>
            <div className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)', fontSize: 10 }}>{k.l}</div>
            <div className="fr-tnum" style={{ fontSize: 26, fontWeight: 600, color: 'var(--fr-ink)', marginTop: 8, letterSpacing: '-0.02em' }}>{k.v}</div>
            <div className="fr-tnum" style={{ fontSize: 11, fontWeight: 600, color: k.neg ? '#DC2626' : 'var(--fr-accent-deep)', marginTop: 2 }}>
              {k.d} <span style={{ color: 'var(--fr-text-soft)', fontWeight: 400 }}>vs mars</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Funnel */}
        <div style={{ background: 'white', borderRadius: 'var(--fr-r-lg)', padding: 24, border: '1px solid var(--fr-line-cool)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>Funnel · 30 derniers jours</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--fr-ink)', marginTop: 4 }}>Conversion par étape</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['7j', '30j', '90j'].map((p, i) => (
                <button key={p} style={{
                  padding: '6px 12px', fontSize: 11, fontWeight: 600,
                  background: i === 1 ? 'var(--fr-ink)' : 'white',
                  color: i === 1 ? 'white' : 'var(--fr-text-muted)',
                  border: '1px solid var(--fr-line-cool)', borderRadius: 6, cursor: 'pointer'
                }}>{p}</button>
              ))}
            </div>
          </div>
          {[
            { l: 'Dépôt', v: 248, p: 100 },
            { l: 'En analyse', v: 224, p: 90 },
            { l: 'Offre envoyée', v: 178, p: 72 },
            { l: 'Acceptée', v: 142, p: 57 },
            { l: 'Signée', v: 134, p: 54 },
            { l: 'Fonds versés', v: 118, p: 48 },
          ].map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px 50px', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--fr-ink)', fontWeight: 500 }}>{s.l}</span>
              <div style={{ height: 22, background: 'var(--fr-bg-cool)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${s.p}%`, height: '100%',
                  background: i === 0 ? 'var(--fr-ink)' : `oklch(${0.32 + i * 0.04} 0.06 ${220 - i * 10})`,
                  display: 'flex', alignItems: 'center', paddingLeft: 10,
                  color: 'white', fontSize: 11, fontWeight: 600
                }}>{s.p}%</div>
              </div>
              <span className="fr-tnum" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fr-ink)', textAlign: 'right' }}>{s.v}</span>
              <span className="fr-tnum" style={{ fontSize: 11, color: 'var(--fr-text-soft)', textAlign: 'right' }}>{i > 0 ? `−${100 - Math.round(s.p / [100, 100, 90, 72, 57, 54][i] * 100)}%` : ''}</span>
            </div>
          ))}
        </div>

        {/* À traiter */}
        <div style={{ background: 'white', borderRadius: 'var(--fr-r-lg)', padding: 24, border: '1px solid var(--fr-line-cool)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div className="fr-eyebrow" style={{ color: '#DC2626' }}>● À traiter aujourd'hui</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--fr-ink)', marginTop: 4 }}>14 actions urgentes</div>
            </div>
          </div>
          {[
            { t: 'Dossiers PENDING > 4h', n: 5, sla: 'L1', urgent: false },
            { t: 'Documents manquants > 7j', n: 3, sla: 'L2', urgent: true },
            { t: 'Offres expirent < 24h', n: 4, sla: 'L1', urgent: false },
            { t: 'Sans réponse client > 48h', n: 2, sla: 'L3', urgent: true },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--fr-line)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  padding: '3px 8px', fontSize: 10, fontWeight: 700,
                  background: a.urgent ? '#FEE2E2' : 'var(--fr-bg-cool)',
                  color: a.urgent ? '#DC2626' : 'var(--fr-text-muted)',
                  borderRadius: 4, fontFamily: 'var(--fr-mono)'
                }}>{a.sla}</span>
                <span style={{ fontSize: 13, color: 'var(--fr-ink)' }}>{a.t}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="fr-tnum" style={{ fontSize: 18, fontWeight: 600, color: 'var(--fr-ink)' }}>{a.n}</span>
                <span style={{ color: 'var(--fr-text-soft)', fontSize: 14 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent dossiers table */}
      <div style={{ background: 'white', borderRadius: 'var(--fr-r-lg)', border: '1px solid var(--fr-line-cool)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--fr-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--fr-ink)' }}>Dossiers récents</div>
            <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', marginTop: 2 }}>Triés par dernière activité</div>
          </div>
          <button className="fr-btn fr-btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Voir tout (142) →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 110px 100px 110px 100px 80px', padding: '12px 24px', background: 'var(--fr-bg-cool)', fontSize: 11, color: 'var(--fr-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span>Réf.</span><span>Client</span><span>Produit</span><span>Montant</span><span>Statut</span><span>Score</span><span>SLA</span>
        </div>
        {[
          { r: 'FNT-2841', c: 'Atelier Méca', p: 'Crédit-bail', m: '85 000 €', s: 'Signature', sc: 87, sla: '02h' },
          { r: 'FNT-2840', c: 'Boulangerie F.', p: 'LOA', m: '32 000 €', s: 'Analyse', sc: 72, sla: '14h' },
          { r: 'FNT-2839', c: 'IT Services SAS', p: 'Leasing IT', m: '120 000 €', s: 'Offre envoyée', sc: 91, sla: '06h' },
          { r: 'FNT-2838', c: 'Transport Dubois', p: 'LLD', m: '48 000 €', s: 'Documents', sc: 68, sla: '22h', warn: true },
          { r: 'FNT-2837', c: 'Cabinet Dr. P.', p: 'Prêt pro', m: '210 000 €', s: 'Versé', sc: 94, sla: '—', done: true },
        ].map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '90px 1fr 110px 100px 110px 100px 80px',
            padding: '14px 24px', borderTop: '1px solid var(--fr-line)',
            fontSize: 13, alignItems: 'center'
          }}>
            <span className="fr-mono" style={{ fontSize: 11, color: 'var(--fr-text-muted)' }}>{r.r}</span>
            <span style={{ fontWeight: 500, color: 'var(--fr-ink)' }}>{r.c}</span>
            <span style={{ color: 'var(--fr-text-muted)' }}>{r.p}</span>
            <span className="fr-tnum" style={{ fontWeight: 600, color: 'var(--fr-ink)' }}>{r.m}</span>
            <span><span style={{
              padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 4,
              background: r.done ? 'var(--fr-accent-soft)' : 'var(--fr-bg-cool)',
              color: r.done ? 'var(--fr-accent-deep)' : 'var(--fr-ink)'
            }}>{r.s}</span></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 40, height: 4, background: 'var(--fr-bg-cool)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${r.sc}%`, height: '100%', background: r.sc > 80 ? 'var(--fr-accent)' : r.sc > 60 ? '#F59E0B' : '#DC2626' }} />
              </div>
              <span className="fr-tnum" style={{ fontSize: 11 }}>{r.sc}</span>
            </span>
            <span className="fr-mono fr-tnum" style={{ fontSize: 11, color: r.warn ? '#DC2626' : 'var(--fr-text-soft)' }}>{r.sla}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

window.DashboardEditorial = DashboardEditorial;
window.DashboardData = DashboardData;
