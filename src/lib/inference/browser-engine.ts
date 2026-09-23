import type {
  BenchmarkStats,
  ClassifyResult,
  EngineInput,
  InferenceEngine,
  RuntimeInfo,
} from "./types";
import { unknownRuntime } from "./types";

type MobileNetModel = {
  classify: (
    img: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    topk?: number,
  ) => Promise<{ className: string; probability: number }[]>;
};

/**
 * Browser demo mode — the original TensorFlow.js / MobileNet v2 pipeline.
 *
 * This engine NEVER reports NPU execution. The only accelerator it can
 * honestly name is the TF.js backend actually in use (webgl / wasm / cpu).
 */
export class BrowserInferenceEngine implements InferenceEngine {
  readonly id = "browser" as const;
  readonly label = "Browser demo mode";

  private model: MobileNetModel | null = null;
  private backend: string | null = null;

  async probe() {
    return typeof window !== "undefined";
  }

  async init() {
    if (this.model) return;
    const tf = await import("@tensorflow/tfjs");
    await tf.ready();
    this.backend = tf.getBackend() ?? null;
    const mobilenet = await import("@tensorflow-models/mobilenet");
    this.model = (await mobilenet.load({
      version: 2,
      alpha: 1.0,
    })) as unknown as MobileNetModel;
  }

  private acceleratorLabel(): string | null {
    if (!this.backend) return null;
    if (this.backend === "webgl") return "GPU (WebGL)";
    if (this.backend === "wasm") return "CPU (WASM)";
    if (this.backend === "webgpu") return "GPU (WebGPU)";
    return `CPU (${this.backend})`;
  }

  getRuntimeInfo(): RuntimeInfo {
    const base = unknownRuntime(this.id, this.label, "browser");
    return {
      ...base,
      accelerator: this.acceleratorLabel(),
      // The backend name is verified, but it is explicitly NOT the NPU.
      acceleratorVerified: this.backend !== null,
      runtime: "TensorFlow.js",
      executionProvider: this.backend ? `tfjs:${this.backend}` : null,
      model: this.model ? "MobileNet v2" : null,
      modelVersion: this.model ? "v2 (alpha 1.0)" : null,
      inputShape: this.model ? "1x224x224x3 (NHWC)" : null,
      precision: this.model ? "float32" : null,
      modelSource: "@tensorflow-models/mobilenet",
      modelLicense: "Apache-2.0",
      device: null,
      processor: null,
      // Model weights are fetched from a CDN on first load, then cached.
      offlineCapable: false,
      notes: ["Runs in the browser tab. Not Snapdragon NPU inference."],
    };
  }

  async classify(input: EngineInput, topK = 5): Promise<ClassifyResult> {
    if (!this.model) throw new Error("Browser engine is not initialised yet.");
    const start = performance.now();
    const predictions = await this.model.classify(input, topK);
    const latencyMs = Math.round(performance.now() - start);
    return { predictions, latencyMs, runtime: this.getRuntimeInfo() };
  }

  async benchmark(input: EngineInput, runs: number): Promise<BenchmarkStats> {
    if (!this.model) throw new Error("Browser engine is not initialised yet.");
    const warmStart = performance.now();
    await this.model.classify(input, 5);
    const warmupMs = Math.round(performance.now() - warmStart);

    const samples: number[] = [];
    for (let i = 0; i < runs; i++) {
      const t = performance.now();
      await this.model.classify(input, 5);
      samples.push(performance.now() - t);
    }
    const avgMs = samples.reduce((a, b) => a + b, 0) / samples.length;
    const info = this.getRuntimeInfo();
    return {
      runs,
      warmupMs,
      avgMs: round2(avgMs),
      minMs: round2(Math.min(...samples)),
      maxMs: round2(Math.max(...samples)),
      throughput: round2(1000 / avgMs),
      accelerator: info.accelerator,
      executionProvider: info.executionProvider,
      engineLabel: this.label,
    };
  }

  dispose() {
    this.model = null;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
