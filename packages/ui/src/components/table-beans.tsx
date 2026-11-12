import { motion } from "motion/react"
import { Frijol } from "@zarape/ui/components/frijol"

/** Frijoles regados en la mesa, como en una partida de lotería. Posiciones fijas, cerca de las orillas. */
const BEANS = [
  { left: "6%", top: "9%", size: 26, rotate: 24 },
  { left: "13%", top: "84%", size: 21, rotate: -40 },
  { left: "44%", top: "4%", size: 19, rotate: 70 },
  { left: "90%", top: "14%", size: 24, rotate: -12 },
  { left: "86%", top: "90%", size: 28, rotate: 38 },
  { left: "57%", top: "94%", size: 18, rotate: -64 },
  { left: "72%", top: "7%", size: 15, rotate: 110 },
]

/** Caen sobre la mesa después de repartir las cartas. Va dentro de un contenedor `relative`. Decorativo. */
export function TableBeans() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {BEANS.map((bean, i) => (
        <motion.span
          key={i}
          className="absolute block drop-shadow-[0_3px_2px_rgb(0_0_0/0.35)]"
          style={{ left: bean.left, top: bean.top, width: bean.size }}
          initial={{ opacity: 0, y: -48, rotate: bean.rotate - 140 }}
          animate={{ opacity: 1, y: 0, rotate: bean.rotate }}
          transition={{ type: "spring", bounce: 0.45, duration: 0.6, delay: 0.6 + i * 0.07 }}
        >
          <Frijol className="block w-full" />
        </motion.span>
      ))}
    </div>
  )
}
