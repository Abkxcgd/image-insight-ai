// Shimmer skeleton shown while the MobileNet model is loading.
export function LoadingSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading model">
      <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
      <ul className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="glass rounded-xl p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-10 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full w-1/3 animate-pulse rounded-full bg-primary/40"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
