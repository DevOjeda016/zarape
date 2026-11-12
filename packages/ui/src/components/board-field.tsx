import type { ComponentProps, ReactNode } from "react"
import { cn } from "cn"
import { WarningCircleIcon } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "motion/react"
import { Frijol } from "@zarape/ui/components/frijol"

/**
 * Campo como casilla de la tabla de lotería (56 px, para pantallas de marca como los logins):
 * marco tinta, recuadro con el ícono (como el número de la carta) que se pone maíz al enfocar,
 * y un frijol que marca la casilla cuando ya tiene algo. `trailing` va a la derecha (p. ej. ver contraseña).
 * Para formularios normales se usa <Input> (44 px).
 */
export function BoardField({
  id,
  label,
  icon,
  filled,
  error,
  hint,
  trailing,
  ...input
}: {
  id: string
  label: string
  icon: ReactNode
  filled: boolean
  error?: string
  hint?: ReactNode
  trailing?: ReactNode
} & Omit<ComponentProps<"input">, "id">) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div
        data-invalid={error ? true : undefined}
        className="group/field flex h-14 overflow-hidden rounded-md border-2 border-tinta bg-carta text-tinta outline-offset-2 transition-[outline-color,border-color] focus-within:outline-3 focus-within:outline-ring data-invalid:border-destructive"
      >
        <span className="relative grid w-14 shrink-0 place-items-center border-r-2 border-tinta bg-papel transition-colors duration-200 group-focus-within/field:bg-maiz group-data-invalid/field:border-destructive">
          {icon}
          <AnimatePresence>
            {filled && (
              <motion.span
                key="frijol"
                className="absolute right-0.5 bottom-1 block w-[22px]"
                initial={{ opacity: 0, scale: 0.3, y: -20, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: -18 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.45 }}
              >
                <Frijol className="block w-full" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-transparent px-4 text-base font-medium text-tinta outline-none"
          {...input}
        />
        {trailing}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key="error"
            id={errorId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5 text-sm font-semibold text-destructive"
          >
            <WarningCircleIcon weight="bold" className="size-4 shrink-0" aria-hidden />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {hint && (
        <p id={hintId} className="text-sm font-medium text-aviso">
          {hint}
        </p>
      )}
    </div>
  )
}

/** Botón para la orilla derecha de una casilla (p. ej. mostrar u ocultar la contraseña). */
export function BoardFieldButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "grid w-14 shrink-0 place-items-center border-l-2 border-tinta text-tinta transition-colors hover:bg-papel focus-visible:bg-maiz focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
}
