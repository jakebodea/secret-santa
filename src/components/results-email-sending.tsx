import { LoadingDots } from "./loading-dots";

export function ResultsEmailSending() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-8 text-center">
        <LoadingDots />
        <h2 className="text-foreground text-3xl font-normal tracking-wide md:text-4xl">
          Sending emails...
        </h2>
      </div>
    </div>
  );
}
