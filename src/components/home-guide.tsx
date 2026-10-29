import { ChevronDown } from "lucide-react";

import { homeFaq, homeFaqJsonLd, homeSteps } from "../lib/home-faq";

/** Below-the-fold "how it works" and FAQ: the home page's searchable copy. */
export function HomeGuide() {
  return (
    <div className="mx-auto max-w-2xl space-y-16 pt-16 pb-8 text-left sm:space-y-20 sm:pt-24">
      <section aria-labelledby="how-it-works" className="space-y-8">
        <h2
          id="how-it-works"
          className="text-foreground text-center text-3xl font-medium tracking-tight sm:text-4xl"
        >
          How it works
        </h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {homeSteps.map((step, index) => (
            <li key={step.title} className="space-y-2 text-center">
              <span className="bg-primary/10 text-primary mx-auto flex size-9 items-center justify-center rounded-full font-serif text-lg">
                {index + 1}
              </span>
              <h3 className="text-foreground text-xl font-medium tracking-tight">
                {step.title}
              </h3>
              <p className="text-foreground/70 text-sm leading-snug sm:text-base">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="space-y-6">
        <h2
          id="faq"
          className="text-foreground text-center text-3xl font-medium tracking-tight sm:text-4xl"
        >
          Questions
        </h2>
        <div className="divide-border border-border divide-y border-y">
          {homeFaq.map((entry) => (
            <details key={entry.question} className="group py-4">
              <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium sm:text-lg [&::-webkit-details-marker]:hidden">
                {entry.question}
                <ChevronDown
                  aria-hidden="true"
                  className="text-muted-foreground size-5 shrink-0 transition-transform duration-200 ease-out group-open:rotate-180"
                />
              </summary>
              <p className="text-foreground/70 pt-2 text-sm leading-relaxed sm:text-base">
                {entry.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        // oxlint-disable-next-line react/no-danger -- static JSON-LD we build ourselves
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
    </div>
  );
}
