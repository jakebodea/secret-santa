import type { HTMLMotionProps } from "framer-motion";

/** Strong ease-out; mirrors --ease-out in styles.css. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** Strong ease-in-out; mirrors --ease-in-out in styles.css. */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/**
 * Shared enter/exit for rows added to or removed from a list. Height + opacity
 * so neighbours glide instead of jumping; exit is quicker than enter.
 */
export const listItemMotion = {
  animate: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.28, ease: EASE_OUT },
      opacity: { delay: 0.06, duration: 0.2, ease: "easeOut" },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.2, ease: EASE_IN_OUT },
      opacity: { duration: 0.12, ease: "easeOut" },
    },
  },
  initial: { height: 0, opacity: 0 },
} satisfies HTMLMotionProps<"div">;
