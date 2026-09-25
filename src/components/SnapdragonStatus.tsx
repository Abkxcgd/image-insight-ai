import { useEffect, useState } from "react";
import { Cpu, HardDrive, Wifi, WifiOff, Zap, ShieldCheck, Box, Gauge } from "lucide-react";
import type { RuntimeInfo } from "@/lib/inference/types";

interface Props {
  runtime: RuntimeInfo | null;
  inferenceMs: number | null;
  fellBackToBrowser?: boolean;
}

const UNKNOWN = "Unavailable";

function Row({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  tone?: "default" | "good" | "warn";
}) {
  const toneClass =
    tone === "good" ? "text-primary" : tone === "warn" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-2xl bg-muted/60 p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-[11px] uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-sm font-semibold break-words ${toneClass}`}>{value}</p>
    </div>
  );
}

/**
 * Hardware/runtime panel. Every value comes from the active inference engine.
 * Anything the backend did not report renders as "Unavailable" — this panel
 * never asserts NPU usage on its own.
 */
export function SnapdragonStatus({ runtime, inferenceMs, fellBackToBrowser }: Props) {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const isNpu = runtime?.accelerator === "NPU" && runtime.acceleratorVerified;
  const acceleratorValue = runtime?.accelerator
    ? runtime.acceleratorVerified
      ? runtime.accelerator
      : `${runtime.accelerator} (unverified)`
    : "NPU status unavailable";

  return (
    <section id="status" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Runtime status</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reported by the engine that actually ran the model.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isNpu
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {runtime?.engineLabel ?? "Starting engine…"}
          </span>
        </div>

        {fellBackToBrowser && (
          <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Local Snapdragon service unreachable — running in browser demo mode. This is not NPU
            inference.
          </p>
        )}
        {runtime?.cpuFallback && (
          <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm">
            Running on CPU fallback — the NPU execution provider did not initialise.
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Row icon={HardDrive} label="Device" value={runtime?.device ?? UNKNOWN} />
          <Row icon={Cpu} label="Processor" value={runtime?.processor ?? UNKNOWN} />
          <Row
            icon={Zap}
            label="AI accelerator"
            value={acceleratorValue}
            tone={isNpu ? "good" : "default"}
          />
          <Row icon={Box} label="Runtime" value={runtime?.runtime ?? UNKNOWN} />
          <Row
            icon={Box}
            label="Execution provider"
            value={runtime?.executionProvider ?? UNKNOWN}
          />
          <Row icon={ShieldCheck} label="Model" value={runtime?.model ?? UNKNOWN} />
          <Row
            icon={Gauge}
            label="Last inference"
            value={inferenceMs !== null ? `${inferenceMs} ms` : "No run yet"}
          />
          <Row
            icon={online ? Wifi : WifiOff}
            label="Network"
            value={online === null ? UNKNOWN : online ? "Online" : "Offline"}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs">
            Processing: {runtime?.processing === "native-local" ? "Local (native)" : "Local (browser)"}
          </span>
          {runtime?.offlineCapable ? (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Offline inference available
            </span>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Offline inference not confirmed
            </span>
          )}
        </div>

        {runtime?.notes?.length ? (
          <ul className="mt-4 space-y-1 text-[11px] text-muted-foreground">
            {runtime.notes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
