import { type ComponentProps, useId } from "react"
import { cn } from "cn"

/** Orden fijo de las franjas del zarape (branding/README.md): chile, maíz, carta, jarra, carta, nopal, rosa, maíz, chile. */
const STRIPES = ["chile", "maiz", "carta", "jarra", "carta", "nopal", "rosa", "maiz", "chile"]

/*
 * Medidas de la orilla, en px. `a` corre a lo largo de la orilla; `b` la atraviesa, de los flecos
 * (afuera del panel) hacia adentro. La onda se repite cada PERIOD px.
 */
const PERIOD = 180
const AMPLITUDE = 6
const BASE = 14
const STRIPE = 3
/** Grosor total: flecos, onda, franjas y un poco de superficie. */
const THICKNESS = 52
/** Lo que la orilla sobresale del panel: desde ahí hacia adentro la superficie ya cubre siempre. */
const OUTSET = BASE - AMPLITUDE + STRIPES.length * STRIPE

const wave = (a: number) => BASE + AMPLITUDE * Math.sin((2 * Math.PI * a) / PERIOD)
const steps = Array.from({ length: PERIOD / 4 + 1 }, (_, i) => i * 4)
const fmt = (n: number) => +n.toFixed(2)

/** Polígono entre dos desfases de la onda (de b1 a b2; sin b2, hasta el final del grosor). */
function band(b1: number, b2: number | null, point: (a: number, b: number) => string) {
  const there = steps.map((a) => point(a, wave(a) + b1))
  const back = [...steps].reverse().map((a) => point(a, b2 === null ? THICKNESS : wave(a) + b2))
  return `M${[...there, ...back].join("L")}Z`
}

/**
 * Orilla de zarape con onda, como tela colgada: flecos, las nueve franjas y luego el color del
 * panel (`fill`), así la orilla del panel sigue la curva. Va dentro de un panel `relative` y se
 * monta sola sobre su orilla de arriba o de la izquierda. Decorativa.
 */
export function ZarapeEdge({
  side = "left",
  fill = "var(--card)",
  className,
  style,
  ...props
}: { side?: "top" | "left"; fill?: string } & ComponentProps<"svg">) {
  const id = `zarape-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const vertical = side === "left"
  const point = (a: number, b: number) => (vertical ? `${fmt(b)} ${fmt(a)}` : `${fmt(a)} ${fmt(b)}`)
  const fringe = steps
    .filter((a) => a % 10 === 0 && a < PERIOD)
    .map((a) => `M${point(a, wave(a) - 9)}L${point(a, wave(a) - 1.5)}`)
    .join("")

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={vertical ? THICKNESS : "100%"}
      height={vertical ? "100%" : THICKNESS}
      className={cn("pointer-events-none absolute", vertical ? "inset-y-0" : "inset-x-0", className)}
      style={{ [side]: -OUTSET, ...style }}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={vertical ? THICKNESS : PERIOD}
          height={vertical ? PERIOD : THICKNESS}
        >
          <path d={fringe} stroke="var(--carta)" strokeWidth="2" strokeLinecap="round" />
          {STRIPES.map((color, i) => (
            <path key={i} d={band(i * STRIPE, (i + 1) * STRIPE, point)} fill={`var(--${color})`} />
          ))}
          <path d={band(STRIPES.length * STRIPE, null, point)} fill={fill} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
