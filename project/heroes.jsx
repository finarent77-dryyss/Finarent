/* global React */
const { useState, useEffect, useRef } = React;

// ---------- Shared bits ----------
const Logo = ({ dark = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 8,
      background: dark ? 'white' : 'var(--fr-ink)',
      display: 'grid', placeItems: 'center',
      color: dark ? 'var(--fr-ink)' : 'white',
      fontFamily: 'var(--fr-serif)', fontSize: 18, fontWeight: 500
    }}>F</div>
    <span style={{
      fontFamily: 'var(--fr-sans)', fontWeight: 600, fontSize: 17,
      letterSpacing: '-0.02em', color: dark ? 'white' : 'var(--fr-ink)'
    }}>Finarent</span>
  </div>
);

const NavBar = ({ dark = false }) => {
  const items = ['Solutions', 'Secteurs', 'Tarifs', 'Investisseurs', 'Ressources'];
  const c = dark ? 'rgba(255,255,255,0.7)' : 'var(--fr-text-muted)';
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 40px',
      borderBottom: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--fr-line)',
    }}>
      <Logo dark={dark} />
      <div style={{ display: 'flex', gap: 32 }}>
        {items.map(i => (
          <a key={i} style={{
            fontSize: 14, color: c, fontWeight: 500, textDecoration: 'none', cursor: 'pointer'
          }}>{i}</a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <a style={{ fontSize: 14, color: c, fontWeight: 500, cursor: 'pointer' }}>Connexion</a>
        <button className="fr-btn fr-btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
          Simuler · 48h
        </button>
      </div>
    </nav>
  );
};

// ---------- Hero 1 — Editorial ----------
const HeroEditorial = () => (
  <div style={{ background: 'var(--fr-bg)', minHeight: 720 }}>
    <NavBar />
    <div style={{ padding: '64px 40px 80px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <span className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>Le courtier·n°1</span>
            <span style={{ width: 24, height: 1, background: 'var(--fr-text-soft)' }} />
            <span className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)' }}>Édition 2026</span>
          </div>
          <h1 className="fr-h1" style={{ margin: 0, color: 'var(--fr-ink)' }}>
            Le financement<br/>
            professionnel,<br/>
            <span className="fr-serif" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: '1.05em' }}>
              repensé.
            </span>
          </h1>
          <p className="fr-body-lg" style={{ marginTop: 32, maxWidth: 480 }}>
            30 partenaires bancaires, une seule interface. Crédit-bail, LOA, prêt pro et leasing
            opérationnel — déposés en 8 minutes, instruits sous 48h.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            <button className="fr-btn fr-btn-primary">Démarrer une simulation →</button>
            <button className="fr-btn fr-btn-ghost">Parler à un courtier</button>
          </div>
          <div style={{
            marginTop: 56, paddingTop: 28, borderTop: '1px solid var(--fr-line)',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32
          }}>
            {[
              ['50M€', 'Financés en 2025'],
              ['1 240', 'Dossiers signés'],
              ['98%', 'Taux d\'accord']
            ].map(([n, l]) => (
              <div key={l}>
                <div className="fr-tnum" style={{ fontFamily: 'var(--fr-serif)', fontSize: 40, lineHeight: 1, color: 'var(--fr-ink)' }}>{n}</div>
                <div className="fr-eyebrow" style={{ color: 'var(--fr-text-muted)', marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: editorial card stack */}
        <div style={{ position: 'relative', height: 560 }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 360, height: 460,
            background: 'var(--fr-ink)', borderRadius: 'var(--fr-r-xl)',
            padding: 32, color: 'white', boxShadow: 'var(--fr-shadow-lg)'
          }}>
            <div className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.5)' }}>Cas client · Avril 26</div>
            <div className="fr-serif" style={{ fontSize: 36, lineHeight: 1.05, marginTop: 24, letterSpacing: '-0.02em' }}>
              "On a financé trois machines en moins d'une semaine — du jamais vu."
            </div>
            <div style={{ position: 'absolute', bottom: 32, left: 32, right: 32 }}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: 20 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Marc L.</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Atelier Méca · BTP</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: 280,
            background: 'white', borderRadius: 'var(--fr-r-xl)',
            padding: 24, boxShadow: 'var(--fr-shadow-md)', border: '1px solid var(--fr-line-cool)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span className="fr-live-dot" />
              <span className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)' }}>En temps réel</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--fr-text-muted)' }}>Taux moyen 60 mois</span>
              <span className="fr-tnum" style={{ fontWeight: 600, fontSize: 17, color: 'var(--fr-ink)' }}>4,12%</span>
            </div>
            <div style={{ height: 1, background: 'var(--fr-line)', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13, color: 'var(--fr-text-muted)' }}>Délai moyen</span>
              <span className="fr-tnum" style={{ fontWeight: 600, fontSize: 17, color: 'var(--fr-ink)' }}>32h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ---------- Hero 2 — Data-forward ----------
const HeroData = () => {
  const partners = ['BNP Paribas', 'Société Générale', 'Crédit Agricole', 'BPCE', 'CIC', 'Crédit Mutuel', 'LCL', 'BPI France', 'Arval', 'ALD Automotive'];
  return (
    <div style={{ background: 'var(--fr-bg-deep)', color: 'white', minHeight: 720 }}>
      <NavBar dark />
      {/* Live ticker */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden', padding: '12px 0'
      }}>
        <div style={{ display: 'flex', gap: 48, animation: 'fr-ticker 40s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, k) => (
            <React.Fragment key={k}>
              {[
                ['Crédit-bail · 60m', '4,12%', '+0.02'],
                ['LOA · 48m', '5,08%', '−0.04'],
                ['LLD · 36m', '5,42%', '+0.01'],
                ['Prêt pro · 84m', '4,68%', '+0.03'],
                ['Leasing IT · 36m', '5,90%', '−0.02'],
                ['RC Pro · annuel', '480€', '−0.5%']
              ].map(([l, v, d], i) => (
                <span key={`${k}-${i}`} className="fr-mono" style={{ fontSize: 12, display: 'inline-flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{v}</span>
                  <span style={{ color: d.startsWith('+') ? 'var(--fr-accent)' : '#F87171' }}>{d}</span>
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ padding: '80px 40px 64px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.9fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, marginBottom: 28 }}>
              <span className="fr-live-dot" />
              <span className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>30 partenaires · Mis à jour 14:32</span>
            </div>
            <h1 className="fr-h1" style={{ margin: 0 }}>
              Comparez 30<br/>partenaires.<br/>
              <span style={{ color: 'var(--fr-accent)' }}>Une seule</span><br/>
              <span style={{ color: 'var(--fr-accent)' }}>simulation.</span>
            </h1>
            <p className="fr-body-lg" style={{ marginTop: 32, maxWidth: 460, color: 'rgba(255,255,255,0.7)' }}>
              Notre moteur de scoring interroge en parallèle l'ensemble du réseau et vous renvoie
              les 3 meilleures offres en moins de 48h.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
              <button className="fr-btn fr-btn-accent">Lancer une simulation</button>
              <button className="fr-btn" style={{ background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                Voir le réseau
              </button>
            </div>
          </div>

          {/* Right: terminal-style match panel */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--fr-r-xl)', padding: 28, fontFamily: 'var(--fr-mono)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--fr-accent)' }} />
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>match.live</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
              <span style={{ color: 'var(--fr-accent)' }}>$</span> match --amount 85000 --duration 60 --type credit-bail
            </div>
            {[
              { partner: 'BNP Leasing', rate: '3,98%', month: '1 542€', score: 94, top: true },
              { partner: 'CA Leasing', rate: '4,12%', month: '1 561€', score: 91 },
              { partner: 'BPCE Lease', rate: '4,28%', month: '1 581€', score: 88 },
              { partner: 'SoGé Equip.', rate: '4,42%', month: '1 599€', score: 84 },
            ].map((p, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                padding: '14px 0', borderTop: i === 0 ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center', fontSize: 13
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {p.top && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--fr-accent)' }} />}
                  <span style={{ color: p.top ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: p.top ? 600 : 400, fontFamily: 'var(--fr-sans)' }}>
                    {p.partner}
                  </span>
                </div>
                <div className="fr-tnum" style={{ color: p.top ? 'var(--fr-accent)' : 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{p.rate}</div>
                <div className="fr-tnum" style={{ color: 'rgba(255,255,255,0.85)' }}>{p.month}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifySelf: 'end' }}>
                  <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${p.score}%`, height: '100%', background: 'var(--fr-accent)' }} />
                  </div>
                  <span className="fr-tnum" style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{p.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partners marquee */}
        <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Réseau de financement</div>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {partners.map(p => (
              <span key={p} style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Hero 3 — Confident minimal ----------
const HeroMinimal = () => (
  <div style={{ background: 'var(--fr-bg)', minHeight: 720 }}>
    <NavBar />
    <div style={{ padding: '120px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="fr-eyebrow" style={{ color: 'var(--fr-accent-deep)', marginBottom: 40 }}>
        ◆ Courtier en financement professionnel
      </div>
      <h1 style={{
        fontFamily: 'var(--fr-serif)', fontWeight: 400,
        fontSize: 'clamp(56px, 8vw, 112px)', lineHeight: 0.95,
        letterSpacing: '-0.035em', color: 'var(--fr-ink)', margin: 0,
        maxWidth: 1000
      }}>
        Le crédit professionnel<br/>
        n'a pas besoin de plus<br/>
        d'<em style={{ color: 'var(--fr-accent-deep)' }}>algorithmes</em>.<br/>
        Il a besoin de <em>moins<br/>de friction</em>.
      </h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 80 }}>
        <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--fr-text-muted)', maxWidth: 420, margin: 0 }}>
          On a réuni 30 banques, 6 produits et un seul formulaire. Vous gardez le contrôle —
          on s'occupe du reste.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="fr-btn fr-btn-primary">Démarrer →</button>
          <button className="fr-btn fr-btn-ghost">Comment ça marche</button>
        </div>
      </div>

      {/* Footnote bar */}
      <div style={{
        marginTop: 96, padding: '24px 0', borderTop: '1px solid var(--fr-line)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32
      }}>
        {[
          ['ORIAS · n°22 005 871', 'Immatriculation'],
          ['Membre AFIB', 'Association courtiers'],
          ['ISO 27001', 'Sécurité données'],
          ['eIDAS qualifié', 'Signature YouSign']
        ].map(([t, s]) => (
          <div key={t}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fr-ink)' }}>{t}</div>
            <div style={{ fontSize: 12, color: 'var(--fr-text-soft)', marginTop: 4 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ---------- Hero 4 — Photographic ----------
const HeroPhoto = () => (
  <div style={{ background: 'var(--fr-bg)', minHeight: 720 }}>
    <NavBar />
    <div style={{ padding: '40px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{
        position: 'relative', borderRadius: 'var(--fr-r-xl)', overflow: 'hidden',
        height: 620, background: 'var(--fr-ink)'
      }}>
        {/* Photo placeholder */}
        <div className="fr-placeholder" style={{
          position: 'absolute', inset: 0,
          backgroundColor: '#1A3658',
          backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px), linear-gradient(135deg, #0A2540 0%, #1A3658 60%, #0E2C4D 100%)`,
          color: 'rgba(255,255,255,0.3)'
        }}>
          <span style={{ fontFamily: 'var(--fr-mono)', fontSize: 11 }}>
            [ PHOTO — équipe artisan + machine outil, lumière naturelle, format 16:9 ]
          </span>
        </div>

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(110deg, rgba(6,24,44,0.85) 0%, rgba(6,24,44,0.45) 50%, transparent 100%)'
        }} />

        {/* Content */}
        <div style={{ position: 'relative', height: '100%', padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="fr-eyebrow" style={{ color: 'var(--fr-accent)' }}>2 700 entreprises financées</div>
          </div>

          <div style={{ maxWidth: 720, color: 'white' }}>
            <h1 style={{
              fontFamily: 'var(--fr-serif)', fontWeight: 400,
              fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1, letterSpacing: '-0.025em',
              margin: 0
            }}>
              Pour les TPE/PME<br/>qui veulent <em>investir</em>,<br/>pas <em>attendre</em>.
            </h1>
            <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.75)', marginTop: 28, maxWidth: 520, lineHeight: 1.5 }}>
              48h pour une réponse ferme. 8 minutes pour déposer.
              30 partenaires bancaires en parallèle.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
              <button className="fr-btn fr-btn-light">Simuler mon financement →</button>
              <button className="fr-btn" style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                Prendre RDV
              </button>
            </div>
          </div>

          {/* Bottom data strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32,
            paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.15)',
            color: 'white'
          }}>
            {[
              ['8 min', 'Dépôt en ligne'],
              ['48h', 'Réponse ferme'],
              ['30+', 'Banques partenaires'],
              ['98%', 'Taux d\'accord']
            ].map(([n, l]) => (
              <div key={l}>
                <div className="fr-tnum" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>{n}</div>
                <div className="fr-eyebrow" style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

window.HeroEditorial = HeroEditorial;
window.HeroData = HeroData;
window.HeroMinimal = HeroMinimal;
window.HeroPhoto = HeroPhoto;
