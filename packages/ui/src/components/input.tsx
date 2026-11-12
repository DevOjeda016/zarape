import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md px-3.5 py-1 text-base transition-[border-color,outline-color] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-tinta disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-papel disabled:opacity-60 border-2 border-tinta bg-carta text-tinta font-medium placeholder:text-tinta/50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
