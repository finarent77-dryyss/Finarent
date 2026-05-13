'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Révèle un titre mot par mot avec stagger + flip 3D.
 * Le mot mis en valeur (`highlight`) reçoit un gradient qui balaie en boucle.
 */
export default function AnimatedHeading({ text, highlight, className = '', highlightClassName = '' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <h2 ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block mr-[0.25em]"
          style={{
            animation: visible ? `word-reveal 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms both` : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          {w}
        </span>
      ))}
      {highlight && (
        <span
          className={`inline-block bg-clip-text text-transparent bg-linear-to-r from-secondary via-accent to-secondary animate-gradient-sweep ${highlightClassName}`}
          style={{
            animation: visible
              ? `word-reveal 0.7s cubic-bezier(0.16,1,0.3,1) ${words.length * 90}ms both, gradient-sweep 3s linear infinite`
              : 'none',
            opacity: visible ? undefined : 0,
            backgroundSize: '200% auto',
          }}
        >
          {highlight}
        </span>
      )}
    </h2>
  );
}
