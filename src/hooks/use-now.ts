import { useSyncExternalStore } from "react";

const TICK_MS = 1000;

// useSyncExternalStore needs a stable snapshot between ticks. Returning
// Date.now() straight from getSnapshot hands React a new value on every call,
// which it reads as a store that never settles and re-renders until it throws.
let now = Date.now();

function subscribe(onTick: () => void) {
  now = Date.now();
  const id = setInterval(() => {
    now = Date.now();
    onTick();
  }, TICK_MS);
  return () => {
    clearInterval(id);
  };
}

function getSnapshot() {
  return now;
}

/** Current time in ms, refreshed once a second. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
