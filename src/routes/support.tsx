import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { SupportCard } from "../components/support-card";
import { pageHead } from "../lib/seo";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () =>
    pageHead({
      description:
        "Super Simple Secret Santa is free with no ads or premium tier. Tips via Venmo, PayPal or Zelle keep it running.",
      path: "/support",
      title: "Support this project",
    }),
});

function SupportPage() {
  return (
    <div className="bg-background min-h-dvh">
      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Header */}
          <div className="animate-reveal space-y-4 text-center">
            <div className="flex justify-center">
              <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
                <Heart className="text-primary fill-primary h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            </div>
            <h1 className="text-foreground text-3xl font-normal tracking-tight sm:text-5xl md:text-6xl">
              Support This Project
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-base font-light tracking-wide sm:text-xl md:text-2xl">
              Help keep Secret Santa free and ad-free for everyone
            </p>
          </div>

          {/* Support Card - without header, unwrapped, default size */}
          <div className="animate-reveal reveal-order-2">
            <SupportCard showHeader={false} wrapped={false} size="default" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border mt-20 border-t py-10">
        <div className="text-muted-foreground container mx-auto space-y-2 px-4 text-center text-sm font-light tracking-wide">
          <p>Your support helps maintain and improve this tool for everyone.</p>
          <p>Thank you for your generosity! :)</p>
          <p>
            <Link
              to="/"
              className="text-foreground hover:text-primary underline underline-offset-4 transition-colors"
            >
              Back to home
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
