import { Loader2 } from "lucide-react";
import { formatConfidence, primaryLabel } from "@/utils/image";
import type { Prediction } from "@/hooks/useImageClassifier";

interface Props {
  predictions: Prediction[] | null;
  isClassifying: boolean;
}

// Displays ranked predictions with animated confidence bars.
export function PredictionList({ predictions, isClassifying }: Props) {
  if (isClassifying) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Analyzing image…</p>
      </div>
    );
  }

  if (!predictions) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Top 5 predictions
      </h3>
      <ul className="space-y-2.5">
        {predictions.map((p, i) => {
          const pct = p.probability * 100;
          return (
            <li
              key={p.className + i}
              className="glass rounded-xl p-3 transition animate-[fade-in_.3s_ease-out]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[image:var(--gradient-primary)] text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate text-sm font-medium capitalize">
                    {primaryLabel(p.className)}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatConfidence(p.probability)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
