import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { buttonVariants } from "./button-variants";

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { className?: string }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ className, size, variant }))}
      {...props}
    />
  );
}

export { Button };
