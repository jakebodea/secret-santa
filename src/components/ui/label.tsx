import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "flex items-center gap-2 leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "text-sm font-medium",
        field: "text-muted-foreground text-sm font-medium",
      },
    },
  }
);

function Label({
  className,
  variant,
  htmlFor,
  ...props
}: React.ComponentProps<"label"> & VariantProps<typeof labelVariants>) {
  return (
    <label
      htmlFor={htmlFor}
      data-slot="label"
      className={cn(labelVariants({ className, variant }))}
      {...props}
    />
  );
}

export { Label };
