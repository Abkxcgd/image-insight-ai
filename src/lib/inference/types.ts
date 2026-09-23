// Engine-agnostic contract between the UI and any inference backend.
//
// IMPORTANT HONESTY RULE: every field below is either reported by the backend
// that actually ran the model, or left null. The UI must render null as
// "unavailable" / "unknown" — it must never infer or hardcode NPU usage.

export interface Prediction {
  className: string;
  probability: number;
}

export type EngineId = "browser" | "local";

/** Where the pixels were processed. Both values are on-device. */
export type ProcessingLocation = "browser" | "native-local";

export interface RuntimeInfo {
  engineId: EngineId;
  /** Human label shown in the UI, e.g. "Browser demo mode". */
  engineLabel: string;
  processing: ProcessingLocation;
  /** e.g. "NPU", "CPU", "GPU (WebGL)". null = could not be determined. */
  accelerator: string | null;
  /** True only when the backend positively confirmed the accelerator. */
  acceleratorVerified: boolean;
  /** e.g. "ONNX Runtime + QNN", "TensorFlow.js". */
  runtime: string | null;
  /** e.g. "QNNExecutionProvider (HTP)". null when not applicable/unknown. */
  executionProvider: string | null;
  /** True when the backend reported it fell back from NPU to CPU. */
  cpuFallback: boolean;
  model: string | null;
  modelVersion: string | null;
  /** e.g. "1x3x224x224 (NCHW)". */
  inputShape: string | null;
  /** e.g. "float32", "w8a8". */
  precision: string | null;
  modelSource: string | null;
  modelLicense: string | null;
  device: string | null;
  processor: string | null;
  /** True when inference needs no network at all once loaded. */
  offlineCapable: boolean;
  /** Free-form backend notes (e.g. op placement summary). */
  notes?: string[];
}

export interface ClassifyResult {
  predictions: Prediction[];
  /** Measured model-execution time in ms, reported by the backend. */
  latencyMs: number;
  runtime: RuntimeInfo;
}

export interface BenchmarkStats {
  runs: number;
  warmupMs: number | null;
  avgMs: number;
  minMs: number;
  maxMs: number;
  /** Inferences per second derived from avgMs. */
  throughput: number;
  accelerator: string | null;
  executionProvider: string | null;
  engineLabel: string;
}

export type EngineInput = HTMLImageElement | HTMLCanvasElement;

export interface InferenceEngine {
  readonly id: EngineId;
  readonly label: string;
  /** Cheap probe: can this engine be used right now? */
  probe(): Promise<boolean>;
  init(): Promise<void>;
  classify(input: EngineInput, topK?: number): Promise<ClassifyResult>;
  getRuntimeInfo(): RuntimeInfo;
  benchmark(input: EngineInput, runs: number): Promise<BenchmarkStats>;
  dispose(): void;
}

export function unknownRuntime(
  engineId: EngineId,
  engineLabel: string,
  processing: ProcessingLocation,
): RuntimeInfo {
  return {
    engineId,
    engineLabel,
    processing,
    accelerator: null,
    acceleratorVerified: false,
    runtime: null,
    executionProvider: null,
    cpuFallback: false,
    model: null,
    modelVersion: null,
    inputShape: null,
    precision: null,
    modelSource: null,
    modelLicense: null,
    device: null,
    processor: null,
    offlineCapable: false,
  };
}
