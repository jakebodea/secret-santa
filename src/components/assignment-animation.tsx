import { useState, useEffect } from "react";

const MESSAGES = [
  "Gathering Santas...",
  "Checking the Nice List...",
  "Wrapping Assignments...",
  "Adding Magic...",
  "Almost Ready!",
];

// 3 seconds total
const DURATION = 3000;
const MESSAGE_DURATION = DURATION / MESSAGES.length;

export function AssignmentAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (currentIndex >= MESSAGES.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsVisible(true);
        // Half of transition duration for smooth fade
      }, 150);
    }, MESSAGE_DURATION);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="space-y-8 text-center">
        {/* Bouncing Loading Dots */}
        <div className="flex h-12 items-center justify-center gap-3">
          <div
            className="bg-primary h-3 w-3 rounded-full"
            style={{
              animation: "bounce-high 1s ease-in-out infinite",
              animationDelay: "0ms",
            }}
          />
          <div
            className="bg-primary h-3 w-3 rounded-full"
            style={{
              animation: "bounce-high 1s ease-in-out infinite",
              animationDelay: "150ms",
            }}
          />
          <div
            className="bg-primary h-3 w-3 rounded-full"
            style={{
              animation: "bounce-high 1s ease-in-out infinite",
              animationDelay: "300ms",
            }}
          />
        </div>
        <style>{`
          @keyframes bounce-high {
            0% {
              transform: translateY(0);
            }
            20% {
              transform: translateY(-16px);
            }
            40% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Text Message */}
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
