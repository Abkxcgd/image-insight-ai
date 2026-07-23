import { Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHistory, type HistoryEntry } from "@/hooks/useHistory";
import { formatConfidence, primaryLabel } from "@/utils/image";

// Renders recent predictions saved to localStorage.
export function HistoryPanel() {
  const { entries, remove, clear } = useHistory();

  if (entries.length === 0) {
    return (
      <section id="history" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="glass rounded-3xl p-10 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No predictions yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your recent classifications will show up here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="history" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Recent <span className="gradient-text">predictions</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved locally in your browser — {entries.length} of 20.
          </p>
        </div>
        <button
          onClick={clear}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium hover:scale-105 transition"
        >
          <Trash2 className="h-4 w-4" /> Clear all
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {entries.map((entry) => (
            <HistoryCard key={entry.id} entry={entry} onRemove={() => remove(entry.id)} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function HistoryCard({ entry, onRemove }: { entry: HistoryEntry; onRemove: () => void }) {
  const top = entry.predictions[0];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass overflow-hidden rounded-2xl"
    >
      <div className="aspect-video overflow-hidden bg-muted">
        {entry.thumbnail && (
          <img
            src={entry.thumbnail}
            alt={primaryLabel(top?.className ?? "Prediction")}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold capitalize">
              {primaryLabel(top?.className ?? "Unknown")}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatConfidence(top?.probability ?? 0)} · {entry.inferenceMs}ms
            </p>
          </div>
          <button
            onClick={onRemove}
            aria-label="Delete entry"
            className="grid h-8 w-8 place-items-center rounded-full bg-muted hover:bg-destructive/20 hover:text-destructive transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          {new Date(entry.createdAt).toLocaleString()}
        </p>
      </div>
    </motion.article>
  );
}
