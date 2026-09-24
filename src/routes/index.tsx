import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Zap, Heart, ShieldCheck, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";

import { FeatureCard } from "../components/feature-card";
import { Button } from "../components/ui/button";
import { clearAllData } from "../lib/storage";

const buttonRevealDelay = 0.75;
const featureRevealDelay = buttonRevealDelay + 0.2;
// After feature animation completes
const animationsCompleteDelay = featureRevealDelay + 0.5;

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "Secret Santa - Organize Your Gift Exchange",
      },
      {
        content:
          "Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.",
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

  const wiggleDuration = isHoverCapable ? 2 : 1.5;

  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-background min-h-screen">
        <main className="container mx-auto px-4 py-6 sm:py-12 md:py-16">
          <div className="mx-auto max-w-3xl space-y-6 text-center sm:space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <m.img
                src={isHovered ? "/santa-playful.svg" : "/santa.svg"}
                alt="Secret Santa"
                className="h-28 w-28 cursor-pointer transition-opacity transition-transform sm:h-40 sm:w-40 md:h-48 md:w-48"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
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
                  opacity: { duration: 0.5, ease: "easeOut" },
                  rotate: {
                    duration: wiggleDuration,
                    ease: "easeOut",
                    times: [
                      0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,
                      0.9, 0.95, 1,
                    ],
                  },
                  scale: { duration: 0.3, ease: "easeOut" },
                  x: {
                    duration: wiggleDuration,
                    ease: "easeOut",
                    times: [
                      0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,
                      0.9, 0.95, 1,
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
              <m.h1
                className="text-foreground text-4xl leading-none font-normal tracking-tight sm:text-6xl md:text-7xl"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1,
                  duration: 0.6,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <span className="font-light italic">
                  {" "}
                  <span className="decoration-primary underline decoration-4">
                    Super
                  </span>{" "}
                  Simple
                </span>{" "}
                Secret Santa
              </m.h1>
              <m.p
                className="text-muted-foreground text-lg font-light tracking-wide sm:text-2xl md:text-3xl"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  duration: 0.6,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                Organize your gift exchange with this super simple tool!
              </m.p>
            </div>

            {/* CTA Button */}
            <m.div
              className="space-y-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: buttonRevealDelay,
                duration: 0.7,
                ease: "easeOut",
              }}
            >
              <Button onClick={handleGetStarted} size="cta">
                Get started
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-muted-foreground text-sm font-light tracking-wide">
                Takes about two minutes
              </p>
            </m.div>
            {/* Features */}
            <m.div
              className="grid gap-2 pt-6 sm:gap-8 sm:pt-12 md:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: featureRevealDelay,
                duration: 0.6,
                ease: "easeOut",
              }}
            >
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: featureRevealDelay,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >
                <FeatureCard
                  icon={Zap}
                  title="No Accounts"
                  description={
                    <>
                      No signups, no logins, no hassle. Just add names and
                      emails and <span className="underline">go</span>.
                    </>
                  }
                  tone="primary"
                />
              </m.div>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: featureRevealDelay,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >
                <FeatureCard
                  icon={Heart}
                  title="Absolutely Free"
                  description={
                    <>
                      No hidden costs, no premium tiers, no upsells.{" "}
                      <span className="underline">Free</span> forever, for
                      everyone.
                    </>
                  }
                  tone="secondary"
                />
              </m.div>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: featureRevealDelay,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >
                <FeatureCard
                  icon={ShieldCheck}
                  title="Privacy First"
                  description={
                    <>
                      Zero data stored or sold. Your info is{" "}
                      <span className="underline">only</span> used to send
                      assignments, then it’s gone.
                    </>
                  }
                  tone="accent"
                />
              </m.div>
            </m.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-border mt-8 border-t py-6 sm:mt-16 sm:py-10">
          <div className="text-muted-foreground container mx-auto space-y-2 px-4 text-center text-sm font-light tracking-wide">
            <p>
              <Link
                to="/support"
                className="text-foreground hover:text-primary underline underline-offset-4 transition-colors"
              >
                Support this project
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
}
