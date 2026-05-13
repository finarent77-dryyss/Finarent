/**
 * Marquee — défilement infini horizontal sans saccade.
 * Duplique les enfants une fois pour faire la boucle parfaite.
 * Usage: <Marquee speed="slow" pauseOnHover>...items...</Marquee>
 */
export default function Marquee({ children, speed = 'normal', pauseOnHover = true, className = '' }) {
  const animClass = speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee';
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div className={`flex w-max gap-6 ${animClass} ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}>
        <div className="flex shrink-0 gap-6">{children}</div>
        <div className="flex shrink-0 gap-6" aria-hidden="true">{children}</div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-white to-transparent z-10"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-white to-transparent z-10"></div>
    </div>
  );
}
