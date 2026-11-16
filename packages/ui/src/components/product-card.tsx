import type { ComponentProps, ReactNode } from "react"
import { cn } from "cn"

/**
 * Carta de producto: marco doble de lotería, precio en el recuadro del número, foto al centro,
 * nombre en mayúsculas al pie y la acción ("Agregar") debajo. Siempre en papel, también sobre la mesa.
 */
export function ProductCard({
  price,
  name,
  description,
  photoSrc,
  action,
  className,
  ...props
}: {
  price: string
  name: string
  description: string
  photoSrc: string
  action: ReactNode
} & ComponentProps<"article">) {
  return (
    <article
      data-theme="papel"
      className={cn("flex flex-col rounded-carta border-3 border-tinta bg-carta p-1.5 text-tinta shadow-carta", className)}
      {...props}
    >
      <div className="flex flex-1 flex-col rounded-[2px] border-2 border-tinta">
        <span className="m-2 self-start border-2 border-tinta px-2 font-heading text-lg leading-tight tabular-nums">
          {price}
        </span>
        <img
          src={photoSrc}
          alt=""
          width={320}
          height={320}
          loading="lazy"
          decoding="async"
          className="mx-3 aspect-square w-[calc(100%-1.5rem)] border-2 border-tinta bg-papel object-cover"
        />
        <h3 className="px-2 pt-3 text-center font-heading text-sm/[17px] text-balance uppercase">{name}</h3>
        <p className="line-clamp-2 flex-1 px-3 pt-1 text-center text-sm text-muted-foreground">{description}</p>
        <div className="p-2 pt-3">{action}</div>
      </div>
    </article>
  )
}
