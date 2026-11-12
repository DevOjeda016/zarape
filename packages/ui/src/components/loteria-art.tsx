/*
 * Dibujos de las cartas de lotería, en el estilo del logo: trazo tinta grueso y colores planos de
 * los tokens. Van dentro de <LoteriaCard> y llenan su ancho. Decorativos: la carta lleva el título.
 */

/** 10 · El café: taza de peltre azul con su café y vapor. */
export function CafeArt() {
  return (
    <svg viewBox="0 0 100 100" className="w-full" aria-hidden="true" focusable="false">
      <g fill="none" stroke="var(--tinta)" strokeWidth="3.5" strokeLinecap="round">
        <path d="M38 27c-4-5 4-8 0-14" />
        <path d="M50 25c-4-5 4-8 0-14" />
        <path d="M62 27c-4-5 4-8 0-14" />
      </g>
      <ellipse cx="50" cy="86" rx="36" ry="7" fill="var(--carta)" stroke="var(--tinta)" strokeWidth="3.5" />
      <path d="M73 47c15-1 15 24-1 23" fill="none" stroke="var(--tinta)" strokeWidth="10" strokeLinecap="round" />
      <path d="M73 47c15-1 15 24-1 23" fill="none" stroke="var(--jarra)" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 39h52l-5 40q-1 6-7 6H36q-6 0-7-6z" fill="var(--jarra)" stroke="var(--tinta)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M27 53q23 6 46 0" fill="none" stroke="var(--carta)" strokeWidth="3" />
      <circle cx="38" cy="67" r="2.2" fill="var(--carta)" />
      <circle cx="60" cy="73" r="1.8" fill="var(--carta)" />
      <circle cx="52" cy="63" r="1.5" fill="var(--carta)" />
      <ellipse cx="50" cy="39" rx="26" ry="5.5" fill="var(--carta)" stroke="var(--tinta)" strokeWidth="3.5" />
      <ellipse cx="50" cy="39.5" rx="20" ry="3.2" fill="var(--frijol)" />
    </svg>
  )
}

/** 7 · La concha: pan dulce con su costra rosa marcada. */
export function ConchaArt() {
  return (
    <svg viewBox="0 0 100 100" className="w-full" aria-hidden="true" focusable="false">
      <path
        d="M10 66q40 18 80 0q-1 12-12 15q-28 8-56 0q-11-3-12-15z"
        fill="var(--barro)"
        stroke="var(--tinta)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M12 66C12 36 30 22 50 22s38 14 38 44q-38 12-76 0z" fill="var(--rosa)" stroke="var(--tinta)" strokeWidth="3.5" strokeLinejoin="round" />
      <g fill="none" stroke="var(--tinta)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M50 70Q44 46 28 34" />
        <path d="M50 70V25" />
        <path d="M50 70Q56 46 72 34" />
        <path d="M50 70Q36 57 16 56" />
        <path d="M50 70Q64 57 84 56" />
      </g>
    </svg>
  )
}
