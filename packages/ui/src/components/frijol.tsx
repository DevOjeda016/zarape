import type { ComponentProps } from "react"
import { motion } from "motion/react"

/** Frijol de lotería: marca la casilla. Decorativo (aria-hidden); quien lo use dice con texto qué marcó. */
export function Frijol(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M2.6 9C1.6 4.2 6.6 1 11.8 2.4c2 .6 3.1.4 5.1-.4 4-1.5 6.6 2 5.6 6-1.1 4.6-6.2 6.6-11.2 6.1C6.1 13.7 3.2 12 2.6 9z"
        fill="var(--frijol)"
        stroke="var(--tinta)"
        strokeWidth="1.5"
      />
      <path d="M6.6 6.4c2.1-1.5 4.3-1.5 6.4-.5" fill="none" stroke="var(--carta)" strokeOpacity=".6" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** Cargando, a la mexicana: tres frijoles que brincan. Anuncia `label` a lectores de pantalla. */
export function FrijolLoader({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2" role="status">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-5"
          animate={{ y: [0, -8, 0], rotate: [0, -25, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
        >
          <Frijol className="block w-full" />
        </motion.span>
      ))}
    </span>
  )
}
