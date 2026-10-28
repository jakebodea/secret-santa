import { Link2, Printer } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { useIsMobile } from "../hooks/use-is-mobile";
import { revealUrl } from "../lib/reveal-link";
import type { RevealCard } from "../lib/reveal-link";
import { QrCode } from "./qr-code";
import { Button } from "./ui/button";

interface RevealCardsProps {
  cards: RevealCard[];
  /** Nobody has email, so printing is the main action on the page. */
  primary?: boolean;
}

async function shareLink(card: RevealCard, url: string, preferShare: boolean) {
  if (preferShare && typeof navigator.share === "function") {
    try {
      await navigator.share({
        text: `${card.giver}, here’s your Secret Santa match. Open it when no one’s looking!`,
        title: "Your Secret Santa match",
        url,
      });
    } catch {
      // Closing the share sheet is not an error.
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success(`Copied ${card.giver}’s link`, { duration: 2000 });
  } catch {
    toast.error("Couldn’t copy the link. Try printing the cards instead.");
  }
}

/**
 * Hand-delivery for people without email: print one QR card each, or copy
 * their private link to text. Matches stay hidden behind the link, so the
 * organizer can print without seeing them.
 */
export function RevealCards({ cards, primary = false }: RevealCardsProps) {
  const isMobile = useIsMobile();

  // Cards exist only after a draw in the browser, never during SSR.
  if (cards.length === 0 || typeof document === "undefined") {
    return null;
  }
  const { origin } = window.location;

  return (
    <section
      aria-labelledby="reveal-cards-heading"
      className="bg-card mx-auto max-w-lg space-y-4 rounded-2xl border px-5 py-5 text-left shadow-xs"
    >
      <div className="space-y-1">
        <h2
          id="reveal-cards-heading"
          className="text-foreground text-base font-medium"
        >
          {primary ? "Hand out the cards" : "No email? Hand them a card"}
        </h2>
        <p className="text-muted-foreground text-sm font-light tracking-wide">
          Each card has a QR code that opens that person’s match. You won’t see
          the matches when you print or copy them.
        </p>
      </div>
      <Button
        onClick={() => {
          window.print();
        }}
        size={primary ? "cta" : "lg"}
        variant={primary ? "default" : "outline"}
        className="w-full"
      >
        <Printer data-icon="inline-start" />
        Print {cards.length} {cards.length === 1 ? "card" : "cards"}
      </Button>
      <ul className="divide-border/60 divide-y">
        {cards.map((card) => (
          <li
            key={card.giver}
            className="flex items-center justify-between gap-3 py-2"
          >
            <span className="min-w-0 truncate font-normal tracking-wide">
              {card.giver}
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`${isMobile ? "Send link" : "Copy link"} for ${card.giver}`}
              onClick={() => {
                void shareLink(card, revealUrl(origin, card), isMobile);
              }}
            >
              <Link2 data-icon="inline-start" />
              {isMobile ? "Send link" : "Copy link"}
            </Button>
          </li>
        ))}
      </ul>
      {createPortal(
        <PrintableCards cards={cards} origin={origin} />,
        document.body
      )}
    </section>
  );
}

function PrintableCards({
  cards,
  origin,
}: {
  cards: RevealCard[];
  origin: string;
}) {
  return (
    <div className="print-cards" aria-hidden>
      <div className="grid grid-cols-2 gap-0">
        {cards.map((card) => (
          <article
            key={card.giver}
            className="border-foreground/40 flex break-inside-avoid flex-col items-center gap-3 border border-dashed px-6 py-8 text-center text-black"
          >
            <p className="text-xs tracking-widest uppercase">
              {card.partyName ?? "Secret Santa"}
            </p>
            <p className="font-serif text-4xl leading-tight break-words">
              For {card.giver}
            </p>
            <QrCode
              value={revealUrl(origin, card)}
              alt={`QR code for ${card.giver}’s match`}
              className="size-40"
            />
            <p className="max-w-56 text-sm leading-snug">
              Scan to see who you’re buying for. Shh, it’s a secret!
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
