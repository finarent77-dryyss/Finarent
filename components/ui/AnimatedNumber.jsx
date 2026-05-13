'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tween fluide vers une valeur cible — relance la transition à chaque
 * changement de `value`. Idéal pour les résultats de simulateurs.
 * Contrairement à AnimatedCounter (one-shot au scroll), celui-ci anime
 * en continu sur les modifications.
 */
export default function AnimatedNumber({ value, duration = 500, format, className = '' }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    fromRef.current = display;
    startRef.current = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(v);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const rendered = format ? format(Math.round(display)) : Math.round(display).toLocaleString('fr-FR');
  return <span className={`tabular-nums ${className}`}>{rendered}</span>;
}
