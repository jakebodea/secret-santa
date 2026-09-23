import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

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
  const participants =
    decodedData?.assignments
      .map((a) => a.giver)
      .filter((name, index, self) => self.indexOf(name) === index)
      .toSorted() || [];

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
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-10 md:gap-16">
              <img
                src="/gift.svg"
                alt="Gift"
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"
              />
              <h1 className="text-3xl leading-tight font-normal tracking-tight sm:text-5xl md:text-6xl">
                Secret Santa Results:
                {decodedData?.partyName && (
                  <>
                    <br />
                    <span className="decoration-primary italic underline decoration-4">
                      {decodedData.partyName}
                    </span>
                  </>
                )}
              </h1>
              <img
                src="/gift.svg"
                alt="Gift"
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"
              />
            </div>
            <p className="text-muted-foreground text-base font-light tracking-wide sm:text-xl md:text-2xl">
              View individual assignments or reveal all at once
            </p>
          </div>

          {/* Warning Banner */}
          <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
            <CardContent>
              <div className="flex items-center gap-4">
                <AlertCircle className="text-destructive h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-destructive font-medium">
                    Warning: This page shows Secret Santa assignments!
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Keep this information confidential to maintain the surprise
                    for all participants.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error state */}
          {error && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Error Loading Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          {decodedData && (
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="w-full flex-1 sm:w-auto">
                <Label
                  htmlFor="peek-participant"
                  className="text-muted-foreground mb-2 block text-sm font-medium"
                >
                  Peek at a participant’s assignment:
                </Label>
                <Select
                  value={selectedParticipant || undefined}
                  onValueChange={(value) => {
                    setSelectedParticipant(value);
                    setShowAll(false);
                  }}
                  disabled={showAll}
                >
                  <SelectTrigger
                    id="peek-participant"
                    className="h-11 w-full sm:w-[280px]"
                  >
                    <SelectValue placeholder="Select a participant..." />
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
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setShowAll(!showAll);
                    if (showAll) {
                      setSelectedParticipant(null);
                    }
                  }}
                  variant={showAll ? "outline" : "default"}
                  className="h-11 gap-2 px-4 sm:px-6"
                >
                  {showAll ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide All
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show All
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Assignment Display */}
          {decodedData && (
            <>
              {/* Peek Mode - Single Assignment */}
              {!showAll && peekedAssignment && (
                <PeekedAssignment assignment={peekedAssignment} />
              )}

              {/* Show All Mode - All Assignments */}
              {showAll && <AllAssignments assignments={assignmentsToShow} />}

              {/* Empty State - No Selection */}
              {!showAll && !selectedParticipant && (
                <Card className="border-muted-foreground/20 border-2 border-dashed">
                  <CardContent className="pt-12 pb-12">
                    <div className="space-y-4 text-center">
                      <Eye className="text-muted-foreground/40 mx-auto h-12 w-12" />
                      <div>
                        <p className="text-foreground mb-1 text-lg font-medium">
                          Select a participant to peek
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Choose someone from the dropdown above to see their
                          assignment, or click “Show All” to reveal everything
                          at once.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border mt-20 border-t py-10">
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

function PeekedAssignment({
  assignment: peekedAssignment,
}: {
  assignment: CompactAssignment;
}) {
  return (
    <div className="bg-primary/5 border-primary/20 rounded-lg border px-6 py-8">
      <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-8">
        <div className="flex flex-col text-center sm:text-left">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Gift Giver
          </p>
          <p
            className="text-foreground text-2xl font-semibold sm:text-3xl md:text-4xl"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
            }}
          >
            {peekedAssignment.giver}
          </p>
        </div>
        <div className="flex flex-col text-center sm:text-left">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase opacity-0">
            &nbsp;
          </p>
          <p
            className="text-muted-foreground mt-1 text-base font-normal italic sm:text-xl md:text-2xl"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
            }}
          >
            is giving to
          </p>
        </div>
        <div className="flex flex-col text-center sm:text-left">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Gift Receiver
          </p>
          <p
            className="text-primary text-2xl font-semibold sm:text-3xl md:text-4xl"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
            }}
          >
            {peekedAssignment.receiver}
          </p>
        </div>
      </div>
    </div>
  );
}

function AllAssignments({
  assignments: assignmentsToShow,
}: {
  assignments: CompactAssignment[];
}) {
  return (
    <div className="bg-primary/5 border-primary/20 rounded-lg border px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:mb-6 sm:gap-8">
          <p className="text-muted-foreground text-left text-[0.65rem] font-medium tracking-wide uppercase sm:text-right sm:text-xs">
            Gift Giver
          </p>
          <p className="text-muted-foreground text-center text-[0.65rem] font-medium tracking-wide uppercase opacity-0 sm:text-xs">
            Spacer
          </p>
          <p className="text-muted-foreground text-right text-[0.65rem] font-medium tracking-wide uppercase sm:text-left sm:text-xs">
            Gift Receiver
          </p>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {assignmentsToShow.map((assignment, index) => (
            <div
              key={index}
              className="border-primary/10 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b pb-5 last:border-b-0 last:pb-0 sm:gap-8 sm:pb-6"
            >
              <p
                className="text-foreground text-left text-2xl font-semibold sm:text-right sm:text-3xl md:text-4xl"
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                }}
              >
                {assignment.giver}
              </p>
              <p
                className="text-muted-foreground text-center text-base font-normal italic sm:text-xl md:text-2xl"
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                }}
              >
                is giving to
              </p>
              <p
                className="text-primary text-right text-2xl font-semibold sm:text-left sm:text-3xl md:text-4xl"
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                }}
              >
                {assignment.receiver}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
