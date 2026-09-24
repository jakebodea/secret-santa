export const ASSIGN_FLOW_STEPS = [
  {
    description: "Give your gift exchange a name, or leave it blank.",
    id: 1,
    label: "Name",
    title: "Name your event",
  },
  {
    description: "Add people one by one or import a spreadsheet.",
    id: 2,
    label: "People",
    title: "Add participants",
  },
  {
    description:
      "Optionally block pairings so certain people can’t draw each other.",
    id: 3,
    label: "Rules",
    title: "Set exclusions",
  },
  {
    description: "Review everyone, generate matches, and email assignments.",
    id: 4,
    label: "Send",
    title: "Confirm & send",
  },
] as const;

export type AssignFlowStepId = (typeof ASSIGN_FLOW_STEPS)[number]["id"];
