import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md px-3.5 py-2.5 text-base transition-[border-color,outline-color] outline-none disabled:cursor-not-allowed disabled:bg-papel disabled:opacity-60 border-2 border-tinta bg-carta text-tinta font-medium placeholder:text-tinta/50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
