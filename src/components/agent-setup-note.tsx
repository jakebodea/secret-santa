import { setupUrl } from "../lib/setup-link";

const ORIGIN = "https://supersimplesecretsanta.com";

// Built by the same code that reads links, so the example can't drift
const exampleSetup = {
  partyName: "Family Exchange",
  participants: [
    { name: "Sam", email: "sam@example.com" },
    { name: "Alex", email: "alex@example.com" },
    { name: "Jo" },
  ],
  exclusions: [{ giver: "Sam", receiver: "Alex" }],
};
const exampleUrl = setupUrl(ORIGIN, exampleSetup);

/**
 * Chat assistants read this page's text but rarely follow links to
 * /llms.txt, so the setup-link instructions live here, collapsed for people.
 */
export function AgentSetupNote() {
  return (
    <details className="mx-auto max-w-md text-left">
      <summary className="hover:text-primary cursor-pointer text-center transition-colors">
        For AI assistants
      </summary>
      <div className="mt-3 space-y-2 text-xs leading-relaxed">
        <p>
          Can’t use this page directly? Reply with a setup link that opens the
          user’s exchange already filled in, instead of asking them to retype
          it:
        </p>
        <p className="font-mono break-all">
          {`${ORIGIN}/assign#setup=<percent-encoded JSON>`}
        </p>
        <p className="font-mono break-all">{JSON.stringify(exampleSetup)}</p>
        <p>
          3–100 people with distinct names. Email is optional: people without
          one get a printable QR card or private link. Exclusions keep two
          people from drawing each other. The link sends nothing; the user
          reviews and draws.{" "}
          <a href={exampleUrl} className="underline underline-offset-4">
            Example link
          </a>
          ,{" "}
          <a href="/llms.txt" className="underline underline-offset-4">
            full format
          </a>
          .
        </p>
      </div>
    </details>
  );
}
