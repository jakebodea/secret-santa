import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { m } from "framer-motion";
import { Zap, Heart, ShieldCheck, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";

import { FeatureCard } from "../components/feature-card";
import { Button } from "../components/ui/button";
import { useWebMCPTools } from "../hooks/use-webmcp-tools";
import { clearAllData } from "../lib/storage";
import { emptySchema } from "../lib/webmcp/tools";

// Santa stays still until the entrance has settled
const animationsCompleteDelay = 0.9;

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "Secret Santa - Organize Your Gift Exchange",
      },
      {
        content:
          "Free Secret Santa organizer. No account. Add people, set exclusions, and share matches by email, QR card, or private link.",
        name: "description",
      },
      {
        content:
          "secret santa, simple secret santa, secret santa free, free secret santa, secret santa generator, secret santa organizer, gift exchange, christmas, holiday, gift organizer, random assignment, secret santa app",
        name: "keywords",
      },
    ],
  }),
});

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeToHoverCapability(onChange: () => void) {
  const mediaQuery = window.matchMedia(HOVER_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
}

function getHoverCapability() {
  return window.matchMedia(HOVER_QUERY).matches;
}

function HomePage() {
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isHoverCapable = useSyncExternalStore(
    subscribeToHoverCapability,
    getHoverCapability,
    () => false
  );
  const navigate = useNavigate();
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAnimationTimeouts = () => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    if (imageResetTimeoutRef.current) {
      clearTimeout(imageResetTimeoutRef.current);
      imageResetTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsComplete(true);
    }, animationsCompleteDelay * 1000);

    return () => {
      clearTimeout(timer);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      if (imageResetTimeoutRef.current) {
        clearTimeout(imageResetTimeoutRef.current);
      }
    };
  }, []);

  const startAnimation = () => {
    if (!animationsComplete || isHoverCapable) {
      return;
    }

    clearAnimationTimeouts();

    // Show playful santa and start animation
    setIsHovered(true);
    setIsAnimating(true);

    // After 1.5 seconds, stop the animation (scale will shrink back over 0.3s)
    resetTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      resetTimeoutRef.current = null;
    }, 1500);

    // After scale animation completes (1.5s + 0.3s), switch back to normal santa
    imageResetTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      imageResetTimeoutRef.current = null;
    }, 1800);
  };

  const handleHoverStart = () => {
    if (!isHoverCapable || !animationsComplete) {
      return;
    }

    clearAnimationTimeouts();
    setIsHovered(true);
    setIsAnimating(true);
  };

  const handleHoverEnd = () => {
    if (!isHoverCapable) {
      return;
    }

    clearAnimationTimeouts();
    setIsAnimating(false);
    setIsHovered(false);
  };

  const handleGetStarted = () => {
    clearAllData();
    navigate({ to: "/assign" });
  };

  const handleAgentStart = async () => {
    await navigate({ to: "/assign" });
    return { next: "configure_exchange" };
  };

  useWebMCPTools([
    {
      name: "start_secret_santa",
      description:
        "Open a new Secret Santa exchange. Use configure_exchange on the next page to add participants and exclusions. Does not send email.",
      inputSchema: emptySchema,
      execute: handleAgentStart,
    },
  ]);

  const wiggleDuration = isHoverCapable ? 2 : 1.5;

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <main className="container mx-auto flex-1 px-4 pt-6 pb-4 sm:pt-12 sm:pb-6 md:pt-16">
        <div className="mx-auto max-w-3xl space-y-6 text-center sm:space-y-8">
          {/* Icon */}
          <div className="animate-pop-in flex justify-center">
            <m.img
              src={isHovered ? "/santa-playful.svg" : "/santa.svg"}
              alt="Secret Santa"
              className="h-28 w-28 cursor-pointer select-none sm:h-40 sm:w-40 md:h-48 md:w-48"
              draggable={false}
              initial={false}
              animate={{
                rotate:
                  isAnimating && animationsComplete
                    ? [0, -12, 12, -10, 10, -8, 8, -6, 6, -4, 4, -2, 2, 0]
                    : 0,
                scale: isAnimating && animationsComplete ? 1.15 : 1,
                x:
                  isAnimating && animationsComplete
                    ? [0, -20, 20, -18, 18, -15, 15, -12, 12, -8, 8, -5, 5, 0]
                    : 0,
              }}
              transition={{
                rotate: {
                  duration: wiggleDuration,
                  ease: "easeOut",
                  times: [
                    0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
                    0.95, 1,
                  ],
                },
                scale: { bounce: 0.3, duration: 0.5, type: "spring" },
                x: {
                  duration: wiggleDuration,
                  ease: "easeOut",
                  times: [
                    0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
                    0.95, 1,
                  ],
                },
              }}
              onMouseEnter={handleHoverStart}
              onMouseLeave={handleHoverEnd}
              onClick={() => {
                startAnimation();
              }}
            />
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="animate-reveal reveal-order-1 text-foreground text-4xl leading-tight font-medium tracking-tight sm:text-6xl">
              <span className="whitespace-nowrap italic">
                <span className="decoration-primary underline decoration-4 underline-offset-4">
                  Super
                </span>{" "}
                Simple
              </span>{" "}
              <span className="whitespace-nowrap">Secret Santa</span>
            </h1>
            <p className="animate-reveal reveal-order-2 text-muted-foreground text-lg font-light tracking-wide sm:text-2xl">
              The easiest way to draw names for your gift exchange.
            </p>
          </div>

          {/* CTA Button */}
          <div className="animate-reveal reveal-order-3 space-y-3 pt-2">
            <Button onClick={handleGetStarted} size="cta" className="group">
              Get started
              <ArrowRight className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </Button>
            <p className="text-muted-foreground text-sm font-light tracking-wide">
              Takes about two minutes
            </p>
          </div>
          {/* Features */}
          <div className="grid gap-2 pt-6 sm:gap-8 sm:pt-12 md:grid-cols-3">
            <div className="animate-reveal reveal-order-4">
              <FeatureCard
                icon={Zap}
                title="No Accounts"
                description={
                  <>
                    No signups, no logins. Just add names and{" "}
                    <span className="underline">go</span>.
                  </>
                }
                tone="primary"
              />
            </div>
            <div className="animate-reveal reveal-order-5">
              <FeatureCard
                icon={Heart}
                title="Absolutely Free"
                description={
                  <>
                    No upsells, no premium tier.{" "}
                    <span className="underline">Free</span> forever.
                  </>
                }
                tone="secondary"
              />
            </div>
            <div className="animate-reveal reveal-order-6">
              <FeatureCard
                icon={ShieldCheck}
                title="Privacy First"
                description={
                  <>
                    Nothing stored or sold. Your info is{" "}
                    <span className="underline">only</span> used to send
                    matches.
                  </>
                }
                tone="accent"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-safe-6 pt-4">
        <div className="text-muted-foreground container mx-auto space-y-2 px-4 text-center text-sm font-light tracking-wide">
          <p>
            <Link
              to="/support"
              className="text-foreground hover:text-primary underline underline-offset-4 transition-colors"
            >
              Support this project
            </Link>
            <span aria-hidden="true"> · </span>
            <a
              href="/llms.txt"
              className="hover:text-primary underline-offset-4 transition-colors hover:underline"
            >
              For AI agents
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
