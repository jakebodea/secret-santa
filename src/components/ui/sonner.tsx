import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    position="top-center"
    offset={16}
    icons={{
      error: <OctagonXIcon className="size-4" />,
      info: <InfoIcon className="size-4" />,
      loading: <Loader2Icon className="size-4 animate-spin" />,
      success: <CircleCheckIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4" />,
    }}
    toastOptions={{
      classNames: {
        success:
          "border-secondary/20 bg-secondary/10 text-secondary shadow-md ring-1 ring-secondary/10 [&_[data-title]]:font-medium [&_[data-icon]]:text-secondary",
        toast: "rounded-xl border",
      },
    }}
    {...props}
  />
);

export { Toaster };
