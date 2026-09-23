import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BenchmarkStats,
  EngineInput,
  InferenceEngine,
  Prediction,
  RuntimeInfo,
} from "@/lib/inference/types";
import { getEnginePreference, resolveEngine } from "@/lib/inference/registry";
import type { EnginePreference } from "@/lib/inference/registry";

export type { Prediction };

/** Kept for backwards compatibility with older imports. */
export const MODEL_NAME = "MobileNet v2 (alpha 1.0)";

/**
 * Engine-agnostic classification hook. It talks to the InferenceEngine
 * adapter, so the same UI works with the browser demo engine or the local
 * Snapdragon ONNX Runtime + QNN service.
 */
export function useImageClassifier(preference?: EnginePreference) {
  const engineRef = useRef<InferenceEngine | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [inferenceMs, setInferenceMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runtimeInfo, setRuntimeInfo] = useState<RuntimeInfo | null>(null);
  const [fellBackToBrowser, setFellBackToBrowser] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsModelLoading(true);
        const pref = preference ?? getEnginePreference();
        const { engine, fellBack } = await resolveEngine(pref);
        if (cancelled) return;
        engineRef.current = engine;
        setFellBackToBrowser(fellBack);
        setRuntimeInfo(engine.getRuntimeInfo());
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Failed to start the AI engine. Please refresh the page.");
      } finally {
        if (!cancelled) setIsModelLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [preference]);

  const classify = useCallback(async (img: EngineInput) => {
    const engine = engineRef.current;
    if (!engine) {
      setError("The AI engine is not ready yet. Please wait a moment.");
      return null;
    }
    try {
      setIsClassifying(true);
      setError(null);
      setPredictions(null);
      setInferenceMs(null);
      const result = await engine.classify(img, 5);
      setPredictions(result.predictions);
      setInferenceMs(result.latencyMs);
      setRuntimeInfo(result.runtime);
      return { results: result.predictions, elapsed: result.latencyMs, runtime: result.runtime };
    } catch (e) {
      console.error(e);
      setError("Something went wrong while analyzing the image.");
      return null;
    } finally {
      setIsClassifying(false);
    }
  }, []);

  const benchmark = useCallback(
    async (img: EngineInput, runs: number): Promise<BenchmarkStats | null> => {
      const engine = engineRef.current;
      if (!engine) return null;
      return engine.benchmark(img, runs);
    },
    [],
  );

  const reset = useCallback(() => {
    setPredictions(null);
    setInferenceMs(null);
    setError(null);
  }, []);

  const modelName = runtimeInfo?.model ?? "Unknown model";

  return {
    classify,
    benchmark,
    predictions,
    inferenceMs,
    isModelLoading,
    isClassifying,
    error,
    reset,
    setError,
    runtimeInfo,
    fellBackToBrowser,
    engineId: runtimeInfo?.engineId ?? null,
    modelName,
  };
}
