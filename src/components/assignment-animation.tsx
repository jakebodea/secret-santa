import { useEffect, useState } from "react";

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
const FADE_MS = 150;

export function AssignmentAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (currentIndex >= MESSAGES.length - 1) {
      return;
    }

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, MESSAGE_DURATION);

    return () => {
      clearTimeout(hideTimer);
    };
  }, [currentIndex]);

  useEffect(() => {
    if (isVisible || currentIndex >= MESSAGES.length - 1) {
      return;
    }

    const advanceTimer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsVisible(true);
    }, FADE_MS);

    return () => {
      clearTimeout(advanceTimer);
    };
  }, [currentIndex, isVisible]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="space-y-8 text-center">
        <LoadingDots />

        <div
          className={`transition-opacity duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <h2 className="text-foreground text-3xl font-normal tracking-wide md:text-4xl">
            {MESSAGES[currentIndex]}
          </h2>
        </div>
      </div>
    </div>
  );
}
