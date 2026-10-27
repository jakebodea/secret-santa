import { Link } from "@tanstack/react-router";

import { Button } from "./ui/button";

export function NotFound() {
  return (
    <main className="bg-background flex min-h-dvh items-center justify-center px-4">
      <div className="space-y-6 text-center">
        <img
          src="/santa-eyes.svg"
          alt=""
          className="animate-pop-in mx-auto size-24 sm:size-28"
        />
        <div className="animate-reveal reveal-order-1 space-y-2">
          <h1 className="text-foreground text-4xl font-normal tracking-tight sm:text-5xl">
            This page isn’t on the list
          </h1>
          <p className="text-muted-foreground font-light tracking-wide">
            The link may be old or mistyped.
          </p>
        </div>
        <div className="animate-reveal reveal-order-2">
          <Button render={<Link to="/" />} nativeButton={false} size="cta">
            Back to home
          </Button>
        </div>
      </div>
    </main>
  );
}
