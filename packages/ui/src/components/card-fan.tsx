import type { PointerEvent } from "react"
import { cn } from "cn"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"
import { LoteriaCard } from "@zarape/ui/components/loteria-card"
import { CafeArt, ConchaArt } from "@zarape/ui/components/loteria-art"

/** Las cartas se reparten: suben desde abajo, giran a su lugar y se quedan. */
const DEAL = { type: "spring", bounce: 0.28, duration: 0.75 } as const

/**
 * Abanico de tres cartas sobre la mesa: la Concha, el Café y al frente la carta 1 (el logo, /carta.svg).
 * Quien lo usa fija el tamaño con --card-h (alto de la carta de enfrente), p. ej. `[--card-h:250px]`.
 * Con mouse, el abanico se inclina un poco hacia el puntero. Decorativo.
 */
export function CardFan({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [7, -7]), { stiffness: 160, damping: 18 })
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-9, 9]), { stiffness: 160, damping: 18 })

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return
    const box = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - box.left) / box.width - 0.5)
    pointerY.set((event.clientY - box.top) / box.height - 0.5)
  }

  function rest() {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <div
      aria-hidden="true"
      onPointerMove={tilt}
      onPointerLeave={rest}
      className={cn(
        "grid h-[calc(var(--card-h)*1.15)] w-[calc(var(--card-h)*1.5)] shrink-0 place-items-center [perspective:1100px]",
        className
      )}
    >
      <motion.div style={{ rotateX, rotateY }} className="grid place-items-center [transform-style:preserve-3d]">
        <motion.div
          initial={{ opacity: 0, x: "0%", y: "70%", rotate: 0 }}
          animate={{ opacity: 1, x: "-62%", y: "6%", rotate: -17 }}
          transition={{ ...DEAL, delay: 0.05 }}
          className="[grid-area:1/1] h-[calc(var(--card-h)*0.88)]"
        >
          <LoteriaCard number={7} title="La concha" className="h-full shadow-carta">
            <ConchaArt />
          </LoteriaCard>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: "0%", y: "70%", rotate: 0 }}
          animate={{ opacity: 1, x: "62%", y: "0%", rotate: 15 }}
          transition={{ ...DEAL, delay: 0.17 }}
          className="[grid-area:1/1] h-[calc(var(--card-h)*0.88)]"
        >
          <LoteriaCard number={10} title="El café" className="h-full shadow-carta">
            <CafeArt />
          </LoteriaCard>
        </motion.div>
        <motion.img
          src="/carta.svg"
          alt=""
          width={130}
          height={200}
          initial={{ opacity: 0, y: "70%", rotate: 0, scale: 0.94 }}
          animate={{ opacity: 1, y: "4%", rotate: -3, scale: 1 }}
          transition={{ ...DEAL, delay: 0.3 }}
          className="[grid-area:1/1] h-[var(--card-h)] w-auto rounded-carta shadow-carta"
        />
      </motion.div>
    </div>
  )
}
