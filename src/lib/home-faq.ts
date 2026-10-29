/**
 * Home page FAQ. The visible list and the FAQPage structured data both render
 * from this, so search engines see exactly what people read.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

export const homeFaq: readonly FaqEntry[] = [
  {
    answer:
      "Yes. There is no premium tier, no ads and no upsell. Optional tips keep it running.",
    question: "Is this Secret Santa generator really free?",
  },
  {
    answer:
      "No. Nobody signs up or logs in, including the organizer. Add names and draw.",
    question: "Do I need an account?",
  },
  {
    answer:
      "No. Email is optional for each person. Anyone without one, such as kids or grandparents, gets a printable QR card or a private link you can text.",
    question: "Can I do Secret Santa without everyone's email?",
  },
  {
    answer:
      "Yes. Add exclusions and the draw will never pair those people, so partners, siblings or roommates won't draw each other.",
    question: "Can I stop couples from drawing each other?",
  },
  {
    answer:
      "Yes. Mark yourself as sitting out to organize the exchange without drawing a name. You still get a link to the full results.",
    question: "Can the organizer run it without playing?",
  },
  {
    answer:
      "From 3 to 100. It works for families, friend groups, classrooms and office gift exchanges.",
    question: "How many people can join?",
  },
  {
    answer:
      "Names stay in your browser. Email addresses are used only to send matches, and nothing is stored or sold.",
    question: "What happens to our names and emails?",
  },
];

export const homeSteps = [
  {
    body: "Type them in or import a spreadsheet. Email is optional.",
    title: "Add everyone",
  },
  {
    body: "Keep couples or housemates from drawing each other.",
    title: "Set exclusions",
  },
  {
    body: "Matches go out by email, printable QR card, or private link.",
    title: "Draw and share",
  },
] as const;

export const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaq.map(({ question, answer }) => ({
    "@type": "Question",
    acceptedAnswer: { "@type": "Answer", text: answer },
    name: question,
  })),
};
