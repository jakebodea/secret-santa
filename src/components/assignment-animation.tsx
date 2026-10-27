import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";

import { EASE_OUT } from "../lib/motion";
import { LoadingDots } from "./loading-dots";

const MESSAGES = [
  "Gathering Santas...",
  "Checking the Nice List...",
  "Wrapping Assignments...",
  "Adding Magic...",
  "Almost Ready!",
];

const DURATION = 3000;
const MESSAGE_DURATION = DURATION / MESSAGES.length;

export function AssignmentAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= MESSAGES.length - 1) {
      return;
    }
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, MESSAGE_DURATION);
    return () => {
      clearTimeout(timer);
    };
  }, [currentIndex]);

  return (
    <m.div
      className="bg-background flex min-h-dvh items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="space-y-8 text-center">
        <LoadingDots />

        {/* Both messages share one grid cell so they crossfade in place */}
        <div className="grid" aria-live="polite">
          <AnimatePresence initial={false}>
            <m.h2
              key={currentIndex}
              className="text-foreground text-3xl font-normal tracking-wide [grid-area:1/1] md:text-4xl"
              initial={{ filter: "blur(4px)", opacity: 0, y: 10 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              exit={{ filter: "blur(4px)", opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              {MESSAGES[currentIndex]}
            </m.h2>
          </AnimatePresence>
        </div>
      </div>
    </m.div>
  );
}
