'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Compteur qui s'anime de 0 vers `to` quand l'élément entre dans le viewport.
 * Utilisé pour les chiffres clés (1500+ clients, 50M€, 98%, etc.).
 */
export default function AnimatedCounter({ to, duration = 1800, prefix = '', suffix = '', className = '' }) {
  const [value, setValue] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (hasRun || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasRun]);

  useEffect(() => {
    if (!hasRun) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic : démarre vite, ralentit
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasRun, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}
