import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Gauge, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BrowserInferenceEngine, LocalServiceEngine } from "@/lib/inference/registry";
import { getLocalEndpoint } from "@/lib/inference/local-service-engine";
import type { BenchmarkStats, InferenceEngine } from "@/lib/inference/types";
import { compressImage, fileToImage, validateImage } from "@/utils/image";

export const Route = createFileRoute("/benchmark")({
  head: () => ({
    meta: [
      { title: "Benchmark — Image Insight AI Snapdragon Edition" },
      {
        name: "description",
        content:
          "Measure real on-device inference latency: warm-up, average, minimum, maximum and throughput for the local NPU and CPU paths.",
      },
      { property: "og:title", content: "Benchmark — Image Insight AI" },
      {
        property: "og:description",
        content: "Measured, never fabricated: on-device inference latency for NPU and CPU paths.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BenchmarkPage,
});

type Row = BenchmarkStats & { key: string };

function BenchmarkPage() {
  const [runs, setRuns] = useState(20);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [imgName, setImgName] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    const err = validateImage(file);
    if (err) return toast.error(err);
    const { img } = await fileToImage(await compressImage(file));
    imgRef.current = img;
    // Filename is not displayed raw — only a sanitised short form.
    setImgName(file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 40));
    setRows([]);
  };

  const run = async (engine: InferenceEngine, key: string) => {
    if (!imgRef.current) return toast.error("Choose an image first");
    setBusy(true);
    try {
      await engine.init();
      const stats = await engine.benchmark(imgRef.current, runs);
      setRows((r) => [...r.filter((x) => x.key !== key), { ...stats, key }]);
    } catch (e) {
      console.error(e);
      toast.error(
        key === "local"
          ? `Local inference service not reachable at ${getLocalEndpoint()}`
          : "Benchmark failed",
      );
    } finally {
      setBusy(false);
      engine.dispose();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="gradient-text">Benchmark</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every number below is measured on this machine, right now. Rows only appear for paths you
          actually run — nothing is estimated or pre-filled.
        </p>

        <div className="glass mt-8 space-y-4 rounded-2xl p-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-muted px-4 py-2 text-xs font-medium transition hover:scale-105"
            >
              {imgName ? `Image: ${imgName}` : "Choose image"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Runs
              <input
                type="number"
                min={1}
                max={200}
                value={runs}
                onChange={(e) => setRuns(Math.max(1, Math.min(200, Number(e.target.value))))}
                className="w-20 rounded-lg bg-muted px-2 py-1 text-foreground"
                aria-label="Number of benchmark runs"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy || !imgName}
              onClick={() => run(new LocalServiceEngine(getLocalEndpoint()), "local")}
              className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:scale-105 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gauge className="h-3.5 w-3.5" />}
              Run local service (NPU/CPU)
            </button>
            <button
              disabled={busy || !imgName}
              onClick={() => run(new BrowserInferenceEngine(), "browser")}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition hover:scale-105 disabled:opacity-50"
            >
              <Gauge className="h-3.5 w-3.5" /> Run browser demo mode
            </button>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="glass mt-6 overflow-x-auto rounded-2xl p-5">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-2 pr-4">Path</th>
                  <th className="pb-2 pr-4">Accelerator</th>
                  <th className="pb-2 pr-4">Runs</th>
                  <th className="pb-2 pr-4">Warm-up</th>
                  <th className="pb-2 pr-4">Avg</th>
                  <th className="pb-2 pr-4">Min</th>
                  <th className="pb-2 pr-4">Max</th>
                  <th className="pb-2">Throughput</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {rows.map((r) => (
                  <tr key={r.key} className="border-t border-border/60">
                    <td className="py-2 pr-4 font-medium">{r.engineLabel}</td>
                    <td className="py-2 pr-4">{r.accelerator ?? "Unavailable"}</td>
                    <td className="py-2 pr-4">{r.runs}</td>
                    <td className="py-2 pr-4">{r.warmupMs !== null ? `${r.warmupMs} ms` : "—"}</td>
                    <td className="py-2 pr-4">{r.avgMs} ms</td>
                    <td className="py-2 pr-4">{r.minMs} ms</td>
                    <td className="py-2 pr-4">{r.maxMs} ms</td>
                    <td className="py-2">{r.throughput}/s</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Latency covers model execution only. Browser demo mode is not Snapdragon NPU
              inference and is shown for reference, not as a cloud comparison.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
