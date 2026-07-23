import { useCallback, useEffect, useRef, useState } from "react";

// Lazy-loaded types (tfjs/mobilenet are dynamically imported to keep initial bundle small
// and to avoid SSR issues since they rely on browser globals).
type MobileNetModel = {
  classify: (
    img: HTMLImageElement,
    topk?: number,
  ) => Promise<{ className: string; probability: number }[]>;
};

export interface Prediction {
  className: string;
  probability: number;
}

export function useImageClassifier() {
  const modelRef = useRef<MobileNetModel | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load MobileNet once on mount (client only).
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

  // Classify an already-loaded HTMLImageElement, returning top-5 predictions.
  const classify = useCallback(async (img: HTMLImageElement) => {
    if (!modelRef.current) {
      setError("Model is not ready yet. Please wait a moment.");
      return;
    }
    try {
      setIsClassifying(true);
      setError(null);
      setPredictions(null);
      const results = await modelRef.current.classify(img, 5);
      setPredictions(results);
    } catch (e) {
      console.error(e);
      setError("Something went wrong while analyzing the image.");
    } finally {
      setIsClassifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPredictions(null);
    setError(null);
  }, []);

  return { classify, predictions, isModelLoading, isClassifying, error, reset, setError };
}
