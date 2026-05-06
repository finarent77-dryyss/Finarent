/* global React */
const { useState: useStateW } = React;

// ---------- Wizard — 5-step financement (refreshed) ----------
const Wizard = () => {
  const [step, setStep] = useStateW(2);
  const [amount, setAmount] = useStateW(85000);
  const [duration, setDuration] = useStateW(60);
  const [product, setProduct] = useStateW('credit-bail');

  const steps = ['Entreprise', 'Projet', 'Simulation', 'Pièces', 'Confirmation'];
  const monthly = Math.round(amount * (0.04 + 0.001 * (60 / duration)) / 12 + amount / duration);

  return (
    <div style={{ background: 'var(--fr-bg)', minHeight: 800, fontFamily: 'var(--fr-sans)' }}>
      {/* Minimal nav */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--fr-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--fr-ink)', display: 'grid', placeItems: 'center', color: 'white', fontFamily: 'var(--fr-serif)', fontSize: 16 }}>F</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--fr-ink)' }}>Finarent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--fr-text-muted)' }}>
          <span>Sauvegardé · 14:31</span>
          <span style={{ width: 1, height: 14, background: 'var(--fr-line)' }} />
          <a style={{ color: 'var(--fr-text-muted)', cursor: 'pointer' }}>Quitter</a>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '40px 32px 0' }}>
        <div className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)', marginBottom: 8 }}>
          Étape {step + 1} / 5
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={i}>
              <div style={{
                height: 3, borderRadius: 2,
                background: i <= step ? 'var(--fr-ink)' : 'var(--fr-line)'
              }} />
              <div style={{ fontSize: 12, fontWeight: i === step ? 600 : 400, color: i <= step ? 'var(--fr-ink)' : 'var(--fr-text-soft)', marginTop: 8 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 32px 80px' }}>
        <h1 className="fr-h2 fr-serif" style={{ margin: 0, color: 'var(--fr-ink)', fontWeight: 400 }}>
          Votre projet en chiffres.
        </h1>
        <p className="fr-body" style={{ marginTop: 12, marginBottom: 40, maxWidth: 560 }}>
          Ajustez les paramètres — la simulation se met à jour en temps réel et compare 30 partenaires en parallèle.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Product */}
            <div>
              <label className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)', display: 'block', marginBottom: 12 }}>
                Type de financement
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {[
                  { id: 'credit-bail', l: 'Crédit-bail', s: 'Achat à terme' },
                  { id: 'loa', l: 'LOA', s: 'Option d\'achat' },
                  { id: 'lld', l: 'LLD', s: 'Location longue durée' },
                  { id: 'pret', l: 'Prêt pro', s: 'Crédit classique' },
                ].map(p => (
                  <button key={p.id} onClick={() => setProduct(p.id)} style={{
                    textAlign: 'left', padding: 16, borderRadius: 'var(--fr-r-md)',
                    background: product === p.id ? 'var(--fr-ink)' : 'white',
                    color: product === p.id ? 'white' : 'var(--fr-ink)',
                    border: `1px solid ${product === p.id ? 'var(--fr-ink)' : 'var(--fr-line-cool)'}`,
                    cursor: 'pointer', transition: 'all .15s'
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.l}</div>
                    <div style={{ fontSize: 11, marginTop: 2, color: product === p.id ? 'rgba(255,255,255,0.6)' : 'var(--fr-text-muted)' }}>{p.s}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <label className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>Montant à financer</label>
                <span className="fr-tnum fr-serif" style={{ fontSize: 28, fontWeight: 400, color: 'var(--fr-ink)', letterSpacing: '-0.02em' }}>
                  {amount.toLocaleString('fr-FR')} €
                </span>
              </div>
              <input type="range" min="5000" max="500000" step="1000" value={amount} onChange={e => setAmount(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--fr-ink)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fr-text-soft)', marginTop: 6 }}>
                <span>5 k€</span><span>500 k€</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)', display: 'block', marginBottom: 12 }}>
                Durée (mois)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {[24, 36, 48, 60, 84].map(d => (
                  <button key={d} onClick={() => setDuration(d)} style={{
                    padding: '12px 8px', fontSize: 13, fontWeight: 600,
                    background: duration === d ? 'var(--fr-ink)' : 'white',
                    color: duration === d ? 'white' : 'var(--fr-ink)',
                    border: `1px solid ${duration === d ? 'var(--fr-ink)' : 'var(--fr-line-cool)'}`,
                    borderRadius: 'var(--fr-r-md)', cursor: 'pointer'
                  }}>{d}</button>
                ))}
              </div>
            </div>

            {/* SIRET autofill */}
            <div>
              <label className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)', display: 'block', marginBottom: 12 }}>
                Votre entreprise (SIRET)
              </label>
              <div style={{
                padding: 16, background: 'white', border: '1px solid var(--fr-line-cool)',
                borderRadius: 'var(--fr-r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fr-ink)' }}>SARL Atelier Méca</div>
                  <div style={{ fontSize: 12, color: 'var(--fr-text-muted)', marginTop: 2 }}>
                    538 912 451 00012 · Métallurgie · 12 salariés
                  </div>
                </div>
                <span className="fr-tag" style={{ background: 'var(--fr-accent-soft)', borderColor: 'transparent', color: 'var(--fr-accent-deep)' }}>
                  <span className="fr-tag-dot" /> Vérifié INSEE
                </span>
              </div>
            </div>
          </div>

          {/* Live simulation panel */}
          <div style={{
            background: 'var(--fr-ink)', color: 'white', borderRadius: 'var(--fr-r-xl)',
            padding: 28, position: 'sticky', top: 24, alignSelf: 'start'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.5)' }}>Simulation en direct</div>
              <span className="fr-live-dot" />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Mensualité estimée</div>
              <div className="fr-tnum fr-serif" style={{ fontSize: 56, fontWeight: 400, lineHeight: 1, marginTop: 8, letterSpacing: '-0.025em', color: 'var(--fr-accent)' }}>
                {monthly.toLocaleString('fr-FR')} €
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
                HT · sur {duration} mois · à partir de
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

            {[
              ['Taux moyen estimé', '4,12%'],
              ['Coût total financement', `${(monthly * duration).toLocaleString('fr-FR')} €`],
              ['Économie fiscale (IS)', `${Math.round(amount * 0.33).toLocaleString('fr-FR')} €`],
              ['Trésorerie préservée', `${amount.toLocaleString('fr-FR')} €`],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{l}</span>
                <span className="fr-tnum" style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}

            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

            <div className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
              Top 3 partenaires (estimation)
            </div>
            {[
              ['BNP Leasing', '3,98%', 94],
              ['CA Leasing', '4,12%', 91],
              ['BPCE Lease', '4,28%', 88],
            ].map(([n, r, s]) => (
              <div key={n} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)',
                fontSize: 13
              }}>
                <span>{n}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="fr-tnum" style={{ color: 'var(--fr-accent)', fontWeight: 600 }}>{r}</span>
                  <span className="fr-tnum" style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--fr-line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <button className="fr-btn fr-btn-ghost">← Précédent</button>
          <div style={{ fontSize: 12, color: 'var(--fr-text-soft)' }}>
            Vos données sont chiffrées · ISO 27001
          </div>
          <button className="fr-btn fr-btn-primary">Continuer →</button>
        </div>
      </div>
    </div>
  );
};

window.Wizard = Wizard;
