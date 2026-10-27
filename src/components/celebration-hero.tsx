import type { ReactNode } from "react";

interface CelebrationHeroProps {
  imageSrc: string;
  partyName?: string;
  title: string;
  description: ReactNode;
}

/** Santa pops in, then the party name, title and copy cascade after it. */
export function CelebrationHero({
  imageSrc,
  partyName,
  title,
  description,
}: CelebrationHeroProps) {
  return (
    <div className="space-y-6 text-center">
      <img
        src={imageSrc}
        alt=""
        draggable={false}
        className="animate-pop-in mx-auto size-28 select-none sm:size-36"
      />
      <div className="animate-reveal reveal-order-1 space-y-3">
        {partyName && (
          <p className="text-primary font-serif text-2xl italic sm:text-3xl">
            {partyName}
          </p>
        )}
        <h1 className="text-foreground text-4xl leading-tight font-normal tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
      </div>
      <div className="animate-reveal reveal-order-2">
        <p className="text-muted-foreground mx-auto max-w-xl text-base font-light tracking-wide sm:text-xl">
          {description}
        </p>
      </div>
    </div>
  );
}
