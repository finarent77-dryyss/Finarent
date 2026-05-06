'use client';

import { useState, useEffect, useCallback } from 'react';
import TestimonialCard from './TestimonialCard';

const AUTOPLAY_MS = 6000;

export default function TestimonialCarousel({ testimonials }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // 1 carte mobile, 2 tablet, 3 desktop — calcule le nombre de "pages"
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const total = testimonials.length;
  const maxIndex = Math.max(0, total - perView);

  const next = useCallback(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), [maxIndex]);
  const prev = useCallback(() => setIndex((i) => (i <= 0 ? maxIndex : i - 1)), [maxIndex]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, next]);

  // Reset index si perView change et qu'on dépasse
  useEffect(() => {
    if (index > maxIndex) setIndex(0);
  }, [maxIndex, index]);

  const slidePct = 100 / perView;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * slidePct}%)` }}
        >
          {testimonials.map((t) => (
            <div key={t.id} className="shrink-0 px-3" style={{ width: `${slidePct}%` }}>
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Page ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-8 bg-secondary' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Précédent"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-secondary hover:bg-secondary hover:text-white flex items-center justify-center text-primary transition-all"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Suivant"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-secondary hover:bg-secondary hover:text-white flex items-center justify-center text-primary transition-all"
          >
            <i className="fa-solid fa-arrow-right text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
