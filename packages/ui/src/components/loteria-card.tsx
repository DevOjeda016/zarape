import type { ComponentProps, ReactNode } from "react"
import { cn } from "cn"

/**
 * Carta de lotería: marco tinta doble sobre papel, número en su recuadro, dibujo al centro y
 * título en mayúsculas al pie. Todo escala con el ancho de la carta (unidades cqw).
 */
export function LoteriaCard({
  number,
  title,
  children,
  className,
  ...props
}: { number: ReactNode; title: string; children: ReactNode } & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "@container flex aspect-[13/20] flex-col rounded-carta border-3 border-tinta bg-carta p-[4%] text-tinta",
        className
      )}
      {...props}
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-[2px] border-2 border-tinta">
        <span className="m-[5cqw] self-start border-2 border-tinta px-[2.5cqw] font-heading text-[10cqw] leading-tight">
          {number}
        </span>
        <div className="flex min-h-0 flex-1 items-center justify-center px-[8cqw]">{children}</div>
        <span className="px-[4cqw] pb-[6cqw] text-center font-heading text-[11cqw] leading-none uppercase">{title}</span>
      </div>
    </div>
  )
}
