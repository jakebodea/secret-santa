import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  colorClass: "primary" | "secondary" | "accent";
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  colorClass,
}: FeatureCardProps) {
  const colorClasses = {
    accent: "bg-accent/25 text-gold",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
  };

  return (
    <div className="flex flex-col items-center space-y-3 p-6">
      <div
        className={`h-14 w-14 rounded-full ${colorClasses[colorClass]} flex items-center justify-center`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-foreground text-xl font-medium tracking-tight sm:text-2xl md:text-3xl">
        {title}
      </h3>
      <p className="text-foreground/70 text-center text-sm leading-tight font-normal tracking-wide sm:text-base md:text-lg">
        {description}
      </p>
    </div>
  );
}
