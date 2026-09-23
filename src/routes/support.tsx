import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { SupportCard } from "../components/support-card";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({
    meta: [
      {
        title: "Support - Secret Santa",
      },
      {
        content:
          "Support the development of Secret Santa. Your contribution helps keep this tool free and available for everyone.",
        name: "description",
      },
    ],
  }),
});

function SupportPage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
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
          <SupportCard showHeader={false} wrapped={false} size="default" />
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
