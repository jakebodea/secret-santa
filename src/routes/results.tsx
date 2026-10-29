import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, m } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { Ref } from "react";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { EASE_OUT } from "../lib/motion";
import { pageHead } from "../lib/seo";

interface CompactAssignment {
  giver: string;
  receiver: string;
}

interface DecodedData {
  assignments: CompactAssignment[];
  partyName?: string;
}

export const Route = createFileRoute("/results")({
  component: ResultsPage,
  validateSearch: (search: Record<string, unknown>): { data?: string } => ({
    data: typeof search.data === "string" ? search.data : undefined,
  }),
  head: () => pageHead({ noindex: true, title: "Secret Santa results" }),
});

function decodeResultsData(data: string | undefined): {
  decodedData: DecodedData | null;
  error: string | null;
} {
  if (!data) {
    return { decodedData: null, error: "No data provided in URL" };
  }
  try {
    // Decode base64 using browser-native atob()
    return { decodedData: JSON.parse(atob(data)) as DecodedData, error: null };
  } catch (decodeError) {
    console.error("Failed to decode data:", decodeError);
    return { decodedData: null, error: "Invalid or corrupted data in URL" };
  }
}

function getAssignmentsToShow(
  decodedData: DecodedData | null,
  showAll: boolean,
  selectedParticipant: string | null
): CompactAssignment[] {
  if (!decodedData) {
    return [];
  }
  if (showAll) {
    return decodedData.assignments;
  }
  if (selectedParticipant) {
    return decodedData.assignments.filter(
      (a) => a.giver === selectedParticipant
    );
  }
  return [];
}

function ResultsPage() {
  const { data } = Route.useSearch();
  const [showAll, setShowAll] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    null
  );

  const { decodedData, error } = decodeResultsData(data);

  // Extract unique participant names
  const participants = (() => {
    if (!decodedData) {
      return [] as string[];
    }
    const names = new Set<string>();
    for (const assignment of decodedData.assignments) {
      names.add(assignment.giver);
    }
    return [...names].toSorted();
  })();

  // Get assignments to display
  const assignmentsToShow = getAssignmentsToShow(
    decodedData,
    showAll,
    selectedParticipant
  );

  // Get selected assignment for peek mode
  const peekedAssignment =
    !showAll && selectedParticipant
      ? decodedData?.assignments.find((a) => a.giver === selectedParticipant)
      : null;

  return (
    <div className="bg-background min-h-dvh">
      <main className="container mx-auto px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="animate-reveal reveal-order-0">
              <img
                src="/gift.svg"
                alt=""
                className="mx-auto size-12 sm:size-14"
              />
            </div>
            <div className="animate-reveal reveal-order-1 space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                Secret Santa results
              </p>
              <h1 className="text-foreground text-4xl leading-tight font-normal tracking-tight sm:text-5xl md:text-6xl">
                {decodedData?.partyName || "All the matches"}
              </h1>
            </div>
          </div>

          <div className="animate-reveal reveal-order-2">
            <div className="bg-accent/25 flex items-start gap-3 rounded-xl px-4 py-3 text-left sm:items-center">
              <EyeOff className="text-gold mt-0.5 size-4 shrink-0 sm:mt-0" />
              <p className="text-foreground/80 text-sm tracking-wide">
                <span className="text-foreground font-medium">
                  Spoilers ahead.
                </span>{" "}
                Keep this page to yourself so the surprise survives.
              </p>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <Card variant="outline">
              <CardHeader>
                <CardTitle variant="destructive">
                  Couldn’t load these results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {error}. Try opening the link from your email again.
                </p>
              </CardContent>
            </Card>
          )}

          {decodedData && (
            <div className="animate-reveal reveal-order-3 space-y-6">
              {/* Controls */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="peek-participant" variant="field">
                    Peek at one person
                  </Label>
                  <Select
                    value={selectedParticipant || ""}
                    onValueChange={(value) => {
                      setSelectedParticipant(value);
                      setShowAll(false);
                    }}
                    disabled={showAll}
                  >
                    <SelectTrigger
                      id="peek-participant"
                      size="lg"
                      className="w-full"
                    >
                      <SelectValue placeholder="Choose a name" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((participant) => (
                        <SelectItem key={participant} value={participant}>
                          {participant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    setShowAll(!showAll);
                    if (showAll) {
                      setSelectedParticipant(null);
                    }
                  }}
                  variant={showAll ? "outline" : "default"}
                  className="h-11 sm:w-36"
                >
                  {showAll ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide all
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show all
                    </>
                  )}
                </Button>
              </div>

              <AnimatePresence mode="popLayout" initial={false}>
                {!showAll && peekedAssignment && (
                  <PeekedAssignment
                    key={`peek-${peekedAssignment.giver}`}
                    assignment={peekedAssignment}
                  />
                )}
                {showAll && (
                  <AllAssignments key="all" assignments={assignmentsToShow} />
                )}
                {!showAll && !selectedParticipant && (
                  <m.div
                    key="empty"
                    {...panelMotion}
                    className="border-border/60 rounded-2xl border border-dashed px-6 py-12 text-center"
                  >
                    <Eye className="text-muted-foreground/50 mx-auto mb-4 size-8" />
                    <p className="text-foreground mb-1 font-medium">
                      Pick someone to peek
                    </p>
                    <p className="text-muted-foreground mx-auto max-w-sm text-sm font-light tracking-wide">
                      See one match at a time, or show them all at once.
                    </p>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border mt-16 border-t py-10">
        <div className="text-muted-foreground container mx-auto px-4 text-center text-sm font-light tracking-wide">
          <p>
            <Link
              to="/support"
              className="text-foreground hover:text-primary underline underline-offset-4 transition-colors"
            >
              Support this project
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

const panelMotion = {
  animate: { filter: "blur(0px)", opacity: 1, scale: 1 },
  exit: {
    filter: "blur(4px)",
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  initial: { filter: "blur(4px)", opacity: 0, scale: 0.98 },
  transition: { duration: 0.3, ease: EASE_OUT },
} satisfies HTMLMotionProps<"div">;

function PeekedAssignment({
  assignment,
  ref,
}: {
  assignment: CompactAssignment;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <m.div
      ref={ref}
      {...panelMotion}
      className="bg-card rounded-2xl border px-6 py-10 text-center shadow-sm"
    >
      <p className="text-muted-foreground text-base font-light tracking-wide sm:text-lg">
        <span className="text-foreground font-normal">{assignment.giver}</span>{" "}
        is buying for
      </p>
      <p className="text-primary mt-2 font-serif text-4xl break-words sm:text-6xl">
        {assignment.receiver}
      </p>
    </m.div>
  );
}

function AllAssignments({
  assignments,
  ref,
}: {
  assignments: CompactAssignment[];
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <m.div
      ref={ref}
      {...panelMotion}
      className="bg-card overflow-hidden rounded-2xl border shadow-sm"
    >
      <div className="text-muted-foreground border-border/60 grid grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)] gap-3 border-b px-4 py-3 text-xs font-medium tracking-widest uppercase sm:gap-6 sm:px-6">
        <span>Giver</span>
        <span />
        <span>Buying for</span>
      </div>
      <ul className="divide-border/60 divide-y">
        {assignments.map((assignment, index) => (
          <m.li
            key={`${assignment.giver}-${assignment.receiver}`}
            className="grid grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1fr)] items-center gap-3 px-4 py-3.5 sm:gap-6 sm:px-6 sm:py-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: Math.min(index, 12) * 0.035,
              duration: 0.3,
              ease: EASE_OUT,
            }}
          >
            <span className="font-serif text-xl break-words sm:text-2xl">
              {assignment.giver}
            </span>
            <ArrowRight className="text-muted-foreground size-4 justify-self-center" />
            <span className="text-primary font-serif text-xl break-words sm:text-2xl">
              {assignment.receiver}
            </span>
          </m.li>
        ))}
      </ul>
    </m.div>
  );
}
