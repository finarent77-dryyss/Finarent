'use client';

import { useRef } from 'react';

/**
 * Tilt 3D + glow qui suit la souris.
 * Wrappe n'importe quel contenu. Hover → la carte s'incline + un halo
 * lumineux suit le curseur.
 */
export default function Tilt3D({ children, max = 12, className = '', glow = true }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const ry = (x - 0.5) * max * 2;
    const rx = -(y - 0.5) * max * 2;
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={`tilt-3d ${glow ? 'tilt-3d-glow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
