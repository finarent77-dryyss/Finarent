/* Ambient — parallax, halos, scroll reveal, grain layer.
   Used everywhere to make the design feel cinematic instead of static. */

const { useEffect, useRef, useState } = React;

/* Parallax wrapper — translates children based on scroll position of nearest scrolling ancestor.
   Uses requestAnimationFrame + IntersectionObserver for perf. */
function Parallax({ speed = 0.3, children, className = "", style = {} }) {
  const ref = useRef(null);
  const [t, setT] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(el);
    // Find scroll container — the artboard's body in design canvas, or window
    const scroller = el.closest('[data-scroll-host]') || window;
    const tick = () => {
      if (!visible) { raf = requestAnimationFrame(tick); return; }
      const rect = el.getBoundingClientRect();
      const host = scroller === window ? { top: 0, height: window.innerHeight } : scroller.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - (host.top + host.height / 2);
      setT(-center * speed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [speed]);
  return (
    <div ref={ref} className={className} style={{ ...style, transform: `translate3d(0, ${t}px, 0)`, willChange: 'transform' }}>
      {children}
    </div>
  );
}

/* Mouse parallax — children drift toward cursor */
function MouseParallax({ depth = 12, children, className = "", style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    const onMove = (e) => {
      const r = parent.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * depth;
      const y = ((e.clientY - r.top) / r.height - 0.5) * depth;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onLeave = () => { el.style.transform = `translate3d(0,0,0)`; };
    parent.addEventListener('mousemove', onMove);
    parent.addEventListener('mouseleave', onLeave);
    return () => { parent.removeEventListener('mousemove', onMove); parent.removeEventListener('mouseleave', onLeave); };
  }, [depth]);
  return <div ref={ref} className={className} style={{ ...style, transition: 'transform 0.4s cubic-bezier(.2,.8,.2,1)', willChange: 'transform' }}>{children}</div>;
}

/* Halo — colored radial blob */
function Halo({ color = 'var(--fr-accent)', size = 480, opacity = 0.45, top, left, right, bottom, blur = 90 }) {
  return (
    <div
      className="fr-halo"
      style={{
        background: color, width: size, height: size, opacity,
        top, left, right, bottom, filter: `blur(${blur}px)`,
      }}
    />
  );
}

/* Reveal — fade up on intersect */
function Reveal({ delay = 0, children, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => el.classList.add('in'), delay); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <Tag ref={ref} className={`fr-reveal ${className}`}>{children}</Tag>;
}

/* Animated counter */
function Counter({ from = 0, to = 100, suffix = "", prefix = "", duration = 1400, format = (n) => Math.round(n).toLocaleString('fr-FR') }) {
  const ref = useRef(null);
  const [v, setV] = useState(from);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf, started = 0;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        started = performance.now();
        const tick = (t) => {
          const k = Math.min(1, (t - started) / duration);
          const eased = 1 - Math.pow(1 - k, 3);
          setV(from + (to - from) * eased);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [from, to, duration]);
  return <span ref={ref} className="fr-tnum">{prefix}{format(v)}{suffix}</span>;
}

/* AmbientBg — backdrop with halos + grain + optional stars */
function AmbientBg({ variant = "warm", stars = false, className = "", style = {} }) {
  return (
    <div className={`fr-grain ${className}`} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      {variant === "warm" && (
        <>
          <Halo color="var(--fr-accent)" size={520} opacity={0.18} top={-120} left={-80} blur={120} />
          <Halo color="var(--fr-indigo)" size={420} opacity={0.10} top={120} right={-120} blur={140} />
        </>
      )}
      {variant === "deep" && (
        <>
          <Halo color="var(--fr-accent)" size={620} opacity={0.32} top={-140} left={-100} blur={120} />
          <Halo color="var(--fr-indigo)" size={520} opacity={0.28} bottom={-180} right={-160} blur={140} />
          <Halo color="var(--fr-accent)" size={380} opacity={0.18} top={'40%'} left={'40%'} blur={140} />
          {stars && <div className="fr-stars" />}
        </>
      )}
      {variant === "cool" && (
        <>
          <Halo color="var(--fr-indigo)" size={460} opacity={0.10} top={-100} right={-100} blur={140} />
          <Halo color="var(--fr-accent)" size={380} opacity={0.08} bottom={-100} left={-80} blur={120} />
        </>
      )}
    </div>
  );
}

/* Logo (wordmark) */
function FinarentLogo({ color = "var(--fr-ink)", size = 26 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color }}>
      <div style={{ width: size, height: size, borderRadius: 7, background: color, position: 'relative', display: 'grid', placeItems: 'center' }}>
        <div style={{ width: size * 0.42, height: size * 0.42, borderRadius: 2, border: '2px solid var(--fr-accent)', borderRight: 'none', borderBottom: 'none', transform: 'rotate(-45deg)' }} />
      </div>
      <span style={{ fontFamily: 'var(--fr-serif)', fontSize: size * 0.85, letterSpacing: '-0.02em', fontWeight: 400 }}>Finarent</span>
    </div>
  );
}

/* Public Header (reusable) */
function PublicHeader({ dark = false }) {
  const ink = dark ? 'white' : 'var(--fr-ink)';
  const muted = dark ? 'rgba(255,255,255,0.7)' : 'var(--fr-text-muted)';
  return (
    <div className="fr-nav" style={{ position: 'relative', zIndex: 5 }}>
      <FinarentLogo color={ink} />
      <nav style={{ display: 'flex', gap: 4 }}>
        {['Solutions', 'Secteurs', 'Process', 'Pourquoi le leasing', 'Témoignages', 'Blog'].map(l => (
          <a key={l} href="#" className="fr-nav-link" style={{ color: muted }}>{l}</a>
        ))}
      </nav>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <a href="#" className="fr-nav-link" style={{ color: muted }}>Connexion</a>
        <a href="#" className="fr-btn fr-btn-accent" style={{ padding: '10px 18px', fontSize: 13 }}>Simuler</a>
      </div>
    </div>
  );
}

/* Marquee row of partner logos (placeholder pills) */
function PartnerMarquee({ dark = false }) {
  const items = ['BNP Paribas', 'Société Générale', 'BPCE', 'Crédit Mutuel', 'CIC', 'LCL', 'Arval', 'ALD', 'Leasecom', 'BPI France', 'CA Leasing', 'Locam'];
  const all = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)', maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}>
      <div className="fr-marquee" style={{ display: 'flex', gap: 32, whiteSpace: 'nowrap', padding: '8px 0' }}>
        {all.map((n, i) => (
          <span key={i} style={{ fontFamily: 'var(--fr-serif)', fontSize: 24, color: dark ? 'rgba(255,255,255,0.4)' : 'var(--fr-text-soft)', letterSpacing: '-0.02em', flexShrink: 0 }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Parallax, MouseParallax, Halo, Reveal, Counter, AmbientBg, FinarentLogo, PublicHeader, PartnerMarquee });
