import { Lock, ArrowDown } from "lucide-react";
import type { RuntimeInfo } from "@/lib/inference/types";

interface Props {
  runtime: RuntimeInfo | null;
}

// Shows the actual processing path for the engine currently in use.
export function PrivacyDashboard({ runtime }: Props) {
  const accelerator = runtime?.accelerator ?? "accelerator unavailable";
  const steps = [
    "Your image",
    "Local preprocessing",
    runtime?.model ? `Local model — ${runtime.model}` : "Local model",
    runtime?.processing === "native-local"
      ? `${accelerator} via ${runtime?.executionProvider ?? "unknown provider"}`
      : `${accelerator} via ${runtime?.runtime ?? "browser runtime"}`,
    "Result shown on this device",
  ];

  return (
    <section id="privacy" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="glass rounded-3xl p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Lock className="h-3 w-3" /> Privacy
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Your images stay on <span className="gradient-text">this device</span>.
            </h2>
            <p className="mt-4 text-muted-foreground">
              No image, frame or thumbnail is sent to a cloud inference API. Classification runs
              either in this browser tab or through the local inference service on your own
              machine, over loopback only.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              History and thumbnails are stored in your browser&apos;s local storage and can be
              cleared at any time from Settings.
            </p>
          </div>

          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={step}>
                <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm font-medium">{step}</div>
                {i < steps.length - 1 && (
                  <div className="flex justify-center py-1 text-muted-foreground">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
