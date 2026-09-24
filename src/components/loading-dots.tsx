export function LoadingDots() {
  return (
    <div className="flex h-12 items-center justify-center gap-3">
      <div className="bg-primary animate-loading-dot size-3 rounded-full" />
      <div className="bg-primary animate-loading-dot-delay-150 size-3 rounded-full" />
      <div className="bg-primary animate-loading-dot-delay-300 size-3 rounded-full" />
    </div>
  );
}
