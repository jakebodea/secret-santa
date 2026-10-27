import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const separatorVariants = cva(
  "shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:h-full data-vertical:w-px",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-border",
        muted: "bg-foreground/30",
      },
    },
  }
);

function Separator({
  className,
  orientation = "horizontal",
  variant,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive> & {
  className?: string;
} & VariantProps<typeof separatorVariants>) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(separatorVariants({ className, variant }))}
      {...props}
    />
  );
}

export { Separator };
