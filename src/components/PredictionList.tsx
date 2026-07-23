import { Copy, Download, Loader2, Share2, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatConfidence, primaryLabel } from "@/utils/image";
import type { Prediction } from "@/hooks/useImageClassifier";
import { downloadPredictionsPdf } from "@/utils/pdf";

interface Props {
  predictions: Prediction[] | null;
  isClassifying: boolean;
  inferenceMs: number | null;
  modelName: string;
  thumbnail?: string;
}

// Displays ranked predictions with confidence bars and action buttons.
export function PredictionList({
  predictions,
  isClassifying,
  inferenceMs,
  modelName,
  thumbnail,
}: Props) {
  if (isClassifying) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Analyzing image…</p>
      </div>
    );
  }

  if (!predictions) return null;

  const asText = () =>
    predictions
      .map((p, i) => `${i + 1}. ${primaryLabel(p.className)} — ${formatConfidence(p.probability)}`)
      .join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `VisionAI predictions (${modelName})\n${asText()}`,
      );
      toast.success("Predictions copied to clipboard");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const share = async () => {
    const text = `Check out my VisionAI prediction:\n${asText()}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "VisionAI predictions", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied — share it anywhere!");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast.error("Sharing failed");
    }
  };

  const exportPdf = async () => {
    try {
      await downloadPredictionsPdf({
        predictions,
        thumbnail,
        modelName,
        inferenceMs,
      });
      toast.success("PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error("PDF generation failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top 5 predictions
        </h3>
        {inferenceMs !== null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            <Timer className="h-3 w-3" /> {inferenceMs} ms
          </span>
        )}
      </div>
      <ul className="space-y-2.5">
        {predictions.map((p, i) => {
          const pct = p.probability * 100;
          return (
            <motion.li
              key={p.className + i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-xl p-3"
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
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 + i * 0.06 }}
                  className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                />
              </div>
            </motion.li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={copy}
          className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium hover:scale-105 transition"
        >
          <Copy className="h-3.5 w-3.5" /> Copy
        </button>
        <button
          onClick={share}
          className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium hover:scale-105 transition"
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
        <button
          onClick={exportPdf}
          className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-3.5 py-2 text-xs font-semibold text-primary-foreground glow hover:scale-105 transition"
        >
          <Download className="h-3.5 w-3.5" /> PDF
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">Model: {modelName}</p>
    </div>
  );
}
