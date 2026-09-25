import type { RuntimeInfo } from "@/lib/inference/types";

interface Props {
  runtime: RuntimeInfo | null;
}

const UNKNOWN = "Unknown";

// Model provenance — only what the active engine reports.
export function ModelInfo({ runtime }: Props) {
  const rows: [string, string][] = [
    ["Model name", runtime?.model ?? UNKNOWN],
    ["Model version", runtime?.modelVersion ?? UNKNOWN],
    ["Input dimensions", runtime?.inputShape ?? UNKNOWN],
    ["Precision", runtime?.precision ?? UNKNOWN],
    ["Runtime", runtime?.runtime ?? UNKNOWN],
    ["Execution provider", runtime?.executionProvider ?? UNKNOWN],
    ["Source", runtime?.modelSource ?? UNKNOWN],
    ["License", runtime?.modelLicense ?? UNKNOWN],
  ];

  return (
    <section id="model" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Model information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Reported by the loaded model, not hardcoded.
        </p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-muted/60 p-4">
              <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className="mt-1 break-words text-sm font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
