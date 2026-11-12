import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/*
 * El Zarape: botones con marco de 2 px. El principal es una ficha: marco tinta y relieve que se
 * hunde al presionar. Tamaños pensados para tocar: xl = 56 px (login), lg = 44 px (touch-min), default = 40 px.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border-2 border-transparent text-sm font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-150 outline-none select-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-tinta bg-primary text-primary-foreground shadow-[0_3px_0_var(--tinta)] hover:-translate-y-px hover:bg-(--accion-hover) hover:shadow-[0_4px_0_var(--tinta)] active:not-aria-[haspopup]:translate-y-[3px] active:not-aria-[haspopup]:shadow-none",
        outline:
          "border-tinta bg-carta text-tinta hover:bg-papel aria-expanded:bg-papel active:not-aria-[haspopup]:translate-y-px",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_6%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground active:not-aria-[haspopup]:translate-y-px",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground active:not-aria-[haspopup]:translate-y-px",
        destructive:
          "border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-background active:not-aria-[haspopup]:translate-y-px",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-sm px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-[0.95rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10",
        "icon-xs": "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11 [&_svg:not([class*='size-'])]:size-5",
        /** Acción principal de una pantalla de marca (login): 56 px, Ultra. */
        xl: "h-14 gap-3 px-6 font-heading text-xl [&_svg:not([class*='size-'])]:size-6",
      },
    },
    compoundVariants: [
      {
        // La ficha grande tiene más relieve
        variant: "default",
        size: "xl",
        class:
          "shadow-[0_5px_0_var(--tinta)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_var(--tinta)] active:not-aria-[haspopup]:translate-y-[3px] active:not-aria-[haspopup]:shadow-[0_2px_0_var(--tinta)]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
