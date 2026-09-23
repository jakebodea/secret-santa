import { createFileRoute } from "@tanstack/react-router";

import { SupportCard } from "../components/support-card";

export const Route = createFileRoute("/test-support")({
  component: TestSupportPage,
  head: () => ({
    meta: [
      {
        title: "Test Support - Secret Santa",
      },
      {
        content: "Test page for the support card component",
        name: "description",
      },
    ],
  }),
});

function TestSupportPage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-foreground mb-8 text-center text-3xl font-normal tracking-tight sm:text-4xl">
            Test Support Card
          </h1>
          <SupportCard />
        </div>
      </main>
    </div>
  );
}
