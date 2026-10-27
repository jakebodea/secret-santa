import { useEffect, useEffectEvent, useRef } from "react";

/** The slice of Cloudflare's `window.turnstile` API this widget uses. */
interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      appearance: "interaction-only";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<TurnstileApi> | undefined;

/** Loads Cloudflare's script once per page. */
const loadTurnstile = (): Promise<TurnstileApi> => {
  if (scriptPromise) {
    return scriptPromise;
  }
  const { promise, resolve, reject } = Promise.withResolvers<TurnstileApi>();
  const script = document.createElement("script");
  script.src = SCRIPT_URL;
  script.async = true;
  script.addEventListener("load", () => {
    if (window.turnstile) {
      resolve(window.turnstile);
    } else {
      reject(new Error("Turnstile failed to initialise"));
    }
  });
  script.addEventListener("error", () => {
    scriptPromise = undefined;
    reject(new Error("Turnstile failed to load"));
  });
  // oxlint-disable-next-line unicorn/prefer-dom-node-append -- @cloudflare/workers-types redeclares append() for HTMLRewriter, so DOM append() no longer typechecks
  document.head.appendChild(script);
  scriptPromise = promise;
  return promise;
};

interface TurnstileWidgetProps {
  siteKey: string;
  /** A fresh single-use token, or `null` when it expires or the check errors. */
  onToken: (token: string | null) => void;
}

/**
 * Cloudflare Turnstile, shown only when the visitor must interact. Tokens are
 * single-use: remount (change `key`) after each send to get a new one.
 */
export function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const reportToken = useEffectEvent(onToken);

  useEffect(() => {
    const element = container.current;
    if (!element) {
      return;
    }
    let widgetId: string | undefined;
    let cancelled = false;
    const mount = async () => {
      try {
        const turnstile = await loadTurnstile();
        if (cancelled) {
          return;
        }
        widgetId = turnstile.render(element, {
          appearance: "interaction-only",
          callback: (token) => reportToken(token),
          "error-callback": () => reportToken(null),
          "expired-callback": () => reportToken(null),
          sitekey: siteKey,
        });
      } catch {
        reportToken(null);
      }
    };
    void mount();
    return () => {
      cancelled = true;
      if (widgetId !== undefined) {
        window.turnstile?.remove(widgetId);
      }
    };
  }, [siteKey]);

  return <div ref={container} className="flex justify-center" />;
}
