import { useCallback, useState } from "react";
import { Classifier } from "@/components/Classifier";
import { FAQ } from "@/components/FAQ";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HistoryPanel } from "@/components/HistoryPanel";
import { HowItWorks } from "@/components/HowItWorks";
import { ModelInfo } from "@/components/ModelInfo";
import { Navbar } from "@/components/Navbar";
import { PrivacyDashboard } from "@/components/PrivacyDashboard";
import { SnapdragonStatus } from "@/components/SnapdragonStatus";
import type { RuntimeInfo } from "@/lib/inference/types";

interface RuntimeState {
  runtime: RuntimeInfo | null;
  inferenceMs: number | null;
  fellBackToBrowser: boolean;
}

// Main landing page — composes all sections of the app.
export function Home() {
  const [state, setState] = useState<RuntimeState>({
    runtime: null,
    inferenceMs: null,
    fellBackToBrowser: false,
  });
  const onRuntimeChange = useCallback((s: RuntimeState) => setState(s), []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Classifier onRuntimeChange={onRuntimeChange} />
        <SnapdragonStatus
          runtime={state.runtime}
          inferenceMs={state.inferenceMs}
          fellBackToBrowser={state.fellBackToBrowser}
        />
        <Features />
        <HowItWorks />
        <ModelInfo runtime={state.runtime} />
        <PrivacyDashboard runtime={state.runtime} />
        <HistoryPanel />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
