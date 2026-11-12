/// <reference types="vite-plugin-pwa/react" />
import type { ReactNode } from "react"
import { ArrowClockwiseIcon, DownloadSimpleIcon, ExportIcon } from "@phosphor-icons/react"
import { useRegisterSW } from "virtual:pwa-register/react"
import { Button } from "@zarape/ui/components/button"
import { useInstallPrompt } from "@zarape/ui/hooks/use-install-prompt"

/**
 * Avisos de la PWA con forma de carta, abajo de la pantalla: versión nueva (manda sobre los demás)
 * e instalación (Chrome/Android con botón; iPhone con instrucciones). Uno a la vez.
 * Va una sola vez en el main.tsx de cada app.
 */
export function PwaNotices() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  const { mode, install, dismiss } = useInstallPrompt()

  if (needRefresh) {
    return (
      <Notice
        title="Recién salido del comal"
        media={
          <span className="grid size-12 shrink-0 place-items-center rounded-sm border-2 border-tinta bg-papel">
            <ArrowClockwiseIcon size={26} aria-hidden />
          </span>
        }
        actions={
          <>
            <Button size="lg" className="h-11 px-4" onClick={() => updateServiceWorker(true)}>
              <ArrowClockwiseIcon data-icon="inline-start" />
              Actualizar
            </Button>
            <Button size="lg" variant="ghost" className="h-11 px-4" onClick={() => setNeedRefresh(false)}>
              Después
            </Button>
          </>
        }
      >
        Hay una versión nueva lista para ti.
      </Notice>
    )
  }

  if (mode === "prompt") {
    return (
      <Notice
        title="Tenla a la mano"
        media={<img src="/isotipo.svg" alt="" width={48} height={48} className="size-12 shrink-0" />}
        actions={
          <>
            <Button size="lg" className="h-11 px-4" onClick={install}>
              <DownloadSimpleIcon data-icon="inline-start" />
              Instalar
            </Button>
            <Button size="lg" variant="ghost" className="h-11 px-4" onClick={dismiss}>
              Ahora no
            </Button>
          </>
        }
      >
        Instálala y ábrela de un toque.
      </Notice>
    )
  }

  if (mode === "ios") {
    return (
      <Notice
        title="Tenla a la mano"
        media={<img src="/isotipo.svg" alt="" width={48} height={48} className="size-12 shrink-0" />}
        actions={
          <Button size="lg" variant="outline" className="h-11 px-4" onClick={dismiss}>
            Listo
          </Button>
        }
      >
        Toca Compartir{" "}
        <ExportIcon size={18} weight="bold" className="inline align-text-bottom" aria-label="(ícono de compartir)" /> y
        luego <strong className="font-semibold text-foreground">Agregar a inicio</strong>.
      </Notice>
    )
  }

  return null
}

/** Carta de aviso: marco tinta doble sobre papel, fija abajo (centrada en el teléfono, a la derecha en pantallas grandes). */
function Notice({
  title,
  media,
  actions,
  children,
}: {
  title: string
  media: ReactNode
  actions: ReactNode
  children: ReactNode
}) {
  return (
    <section
      aria-label={title}
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-carta border-3 border-tinta bg-carta p-1.5 shadow-carta motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 sm:right-6 sm:bottom-6 sm:left-auto sm:mx-0 sm:w-md print:hidden"
    >
      <div data-theme="papel" className="flex items-start gap-3 rounded-sm border-2 border-tinta p-3 text-foreground">
        {media}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-heading text-lg leading-tight">{title}</p>
          <p className="text-sm text-muted-foreground">{children}</p>
          <div className="mt-2 flex flex-wrap gap-2">{actions}</div>
        </div>
      </div>
    </section>
  )
}
