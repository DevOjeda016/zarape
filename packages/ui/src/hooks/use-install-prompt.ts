import { useCallback, useEffect, useState } from "react"

/** Evento de Chrome, Edge y Android para instalar la PWA (todavía no viene en los tipos del DOM). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/** `prompt`: el navegador puede instalar. `ios`: Safari en iPhone o iPad, se instala a mano. */
export type InstallMode = "prompt" | "ios" | null

const DISMISSED_KEY = "zarape.install.dismissedAt"
/** Después de "Ahora no", el aviso no vuelve en dos semanas. */
const QUIET_DAYS = 14

function dismissedRecently() {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY))
    return at > 0 && Date.now() - at < QUIET_DAYS * 86_400_000
  } catch {
    return false
  }
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** Safari de iOS no avisa que se puede instalar: hay que explicar cómo hacerlo. */
function isIosSafari() {
  const ua = navigator.userAgent
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

/** Aviso propio de instalación: guarda el evento del navegador y recuerda si el usuario dijo "Ahora no". */
export function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [mode, setMode] = useState<InstallMode>(() =>
    !isStandalone() && !dismissedRecently() && isIosSafari() ? "ios" : null
  )

  useEffect(() => {
    const onPrompt = (e: Event) => {
      // Sin esto el navegador muestra su propia barra; usamos el aviso de la marca
      e.preventDefault()
      if (dismissedRecently()) return
      setEvent(e as BeforeInstallPromptEvent)
      setMode("prompt")
    }
    const onInstalled = () => {
      setEvent(null)
      setMode(null)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!event) return
    await event.prompt()
    await event.userChoice
    // El evento solo sirve una vez, se instale o no
    setEvent(null)
    setMode(null)
  }, [event])

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    } catch {
      // Sin almacenamiento (modo privado): solo se oculta en esta visita
    }
    setMode(null)
  }, [])

  return { mode, install, dismiss }
}
