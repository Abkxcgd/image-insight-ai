import { useCallback, useEffect, useRef, useState } from "react";

type MobileNetModel = {
  classify: (
    img: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    topk?: number,
  ) => Promise<{ className: string; probability: number }[]>;
};

export interface Prediction {
  className: string;
  probability: number;
}

export const MODEL_NAME = "MobileNet v2 (alpha 1.0)";

export function useImageClassifier() {
  const modelRef = useRef<MobileNetModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [inferenceMs, setInferenceMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lazy-load MobileNet only in the browser.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsModelLoading(true);
        const tf = await import("@tensorflow/tfjs");
        await tf.ready();
        const mobilenet = await import("@tensorflow-models/mobilenet");
        const model = await mobilenet.load({ version: 2, alpha: 1.0 });
        if (!cancelled) modelRef.current = model as unknown as MobileNetModel;
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Failed to load AI model. Please refresh the page.");
      } finally {
        if (!cancelled) setIsModelLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const classify = useCallback(async (img: HTMLImageElement) => {
    if (!modelRef.current) {
      setError("Model is not ready yet. Please wait a moment.");
      return null;
    }
    try {
      setIsClassifying(true);
      setError(null);
      setPredictions(null);
      setInferenceMs(null);
      const start = performance.now();
      const results = await modelRef.current.classify(img, 5);
      const elapsed = Math.round(performance.now() - start);
      setPredictions(results);
      setInferenceMs(elapsed);
      return { results, elapsed };
    } catch (e) {
      console.error(e);
      setError("Something went wrong while analyzing the image.");
      return null;
    } finally {
      setIsClassifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPredictions(null);
    setInferenceMs(null);
    setError(null);
  }, []);

  return {
    classify,
    predictions,
    inferenceMs,
    isModelLoading,
    isClassifying,
    error,
    reset,
    setError,
    modelName: MODEL_NAME,
  };
}
