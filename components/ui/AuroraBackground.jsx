/**
 * Fond décoratif avec blobs gradient flottants.
 * À placer en `absolute inset-0` dans une section `relative overflow-hidden`.
 * Variants:
 *  - 'soft'   → discret, sections blanches qui manquent de vie
 *  - 'vivid'  → plus saturé, sections de mise en valeur
 *  - 'dark'   → pour fonds sombres (couleurs lumineuses)
 *  - 'brand'  → identique au CTA "Prêt à développer" : indigo → teal → emerald
 */
export default function AuroraBackground({ variant = 'soft', className = '' }) {
  const palette = {
    soft:  ['bg-secondary/15', 'bg-accent/15',  'bg-purple-300/15'],
    vivid: ['bg-secondary/30', 'bg-accent/25',  'bg-pink-300/20'],
    dark:  ['bg-secondary/25', 'bg-accent/20',  'bg-blue-400/15'],
    // Brand = palette exacte du CTA premium (capture client) — indigo / teal / emerald
    brand: ['bg-secondary/25', 'bg-teal-400/20', 'bg-accent/25'],
  }[variant] || ['bg-secondary/15', 'bg-accent/15', 'bg-purple-300/15'];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <div className={`absolute -top-32 -left-20 w-[450px] h-[450px] ${palette[0]} rounded-full blur-[100px] animate-blob`}></div>
      <div className={`absolute top-1/3 -right-24 w-[380px] h-[380px] ${palette[1]} rounded-full blur-[110px] animate-blob-delay`}></div>
      <div className={`absolute -bottom-32 left-1/3 w-[420px] h-[420px] ${palette[2]} rounded-full blur-[120px] animate-blob`} style={{ animationDelay: '-12s' }}></div>
    </div>
  );
}
