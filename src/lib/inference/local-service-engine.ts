import type {
  BenchmarkStats,
  ClassifyResult,
  EngineInput,
  InferenceEngine,
  RuntimeInfo,
} from "./types";
import { unknownRuntime } from "./types";

/**
 * Talks to the local ONNX Runtime + QNN sidecar running on the user's
 * Snapdragon Windows PC (see `local-inference/`).
 *
 * Every runtime field comes straight from the sidecar's /health response.
 * Nothing here guesses at NPU usage.
 */

export const DEFAULT_LOCAL_ENDPOINT = "http://127.0.0.1:8731";

export function getLocalEndpoint(): string {
  if (typeof window === "undefined") return DEFAULT_LOCAL_ENDPOINT;
  return localStorage.getItem("iiai:local-endpoint") || DEFAULT_LOCAL_ENDPOINT;
}

export function setLocalEndpoint(url: string) {
  localStorage.setItem("iiai:local-endpoint", url);
}

interface HealthResponse {
  ok: boolean;
  runtime?: string | null;
  runtime_version?: string | null;
  execution_provider?: string | null;
  accelerator?: string | null;
  accelerator_verified?: boolean;
  cpu_fallback?: boolean;
  model?: string | null;
  model_version?: string | null;
  input_shape?: string | null;
  precision?: string | null;
  model_source?: string | null;
  model_license?: string | null;
  device?: string | null;
  processor?: string | null;
  offline_capable?: boolean;
  notes?: string[];
}

export class LocalServiceEngine implements InferenceEngine {
  readonly id = "local" as const;
  readonly label = "Snapdragon local inference";

  private health: HealthResponse | null = null;

  constructor(private endpoint: string = getLocalEndpoint()) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.endpoint}${path}`, {
      ...init,
      // Loopback only — never a remote host.
      mode: "cors",
    });
    if (!res.ok) {
      throw new Error(`Local inference service error ${res.status}: ${await res.text()}`);
    }
    return (await res.json()) as T;
  }

  async probe(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${this.endpoint}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return false;
      this.health = (await res.json()) as HealthResponse;
      return this.health.ok === true;
    } catch {
      this.health = null;
      return false;
    }
  }

  async init() {
    this.health = await this.request<HealthResponse>("/health");
    if (!this.health.ok) throw new Error("Local inference service reported an unhealthy model.");
  }

  getRuntimeInfo(): RuntimeInfo {
    const base = unknownRuntime(this.id, this.label, "native-local");
    const h = this.health;
    if (!h) return base;
    return {
      ...base,
      accelerator: h.accelerator ?? null,
      acceleratorVerified: h.accelerator_verified === true,
      runtime: h.runtime_version ? `${h.runtime} ${h.runtime_version}` : (h.runtime ?? null),
      executionProvider: h.execution_provider ?? null,
      cpuFallback: h.cpu_fallback === true,
      model: h.model ?? null,
      modelVersion: h.model_version ?? null,
      inputShape: h.input_shape ?? null,
      precision: h.precision ?? null,
      modelSource: h.model_source ?? null,
      modelLicense: h.model_license ?? null,
      device: h.device ?? null,
      processor: h.processor ?? null,
      offlineCapable: h.offline_capable === true,
      notes: h.notes,
    };
  }

  private async toJpegBlob(input: EngineInput): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const w = input instanceof HTMLCanvasElement ? input.width : input.naturalWidth;
    const h = input instanceof HTMLCanvasElement ? input.height : input.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(input, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
    if (!blob) throw new Error("Could not encode frame");
    return blob;
  }

  async classify(input: EngineInput, topK = 5): Promise<ClassifyResult> {
    const blob = await this.toJpegBlob(input);
    const form = new FormData();
    // Filename is fixed — we never send the user's original filename.
    form.append("image", blob, "frame.jpg");
    form.append("top_k", String(topK));
    const data = await this.request<{
      predictions: { className: string; probability: number }[];
      latency_ms: number;
      health: HealthResponse;
    }>("/classify", { method: "POST", body: form });
    if (data.health) this.health = data.health;
    return {
      predictions: data.predictions,
      latencyMs: Math.round(data.latency_ms),
      runtime: this.getRuntimeInfo(),
    };
  }

  async benchmark(input: EngineInput, runs: number): Promise<BenchmarkStats> {
    const blob = await this.toJpegBlob(input);
    const form = new FormData();
    form.append("image", blob, "frame.jpg");
    form.append("runs", String(runs));
    const data = await this.request<{
      runs: number;
      warmup_ms: number | null;
      avg_ms: number;
      min_ms: number;
      max_ms: number;
      throughput: number;
      accelerator: string | null;
      execution_provider: string | null;
    }>("/benchmark", { method: "POST", body: form });
    return {
      runs: data.runs,
      warmupMs: data.warmup_ms,
      avgMs: data.avg_ms,
      minMs: data.min_ms,
      maxMs: data.max_ms,
      throughput: data.throughput,
      accelerator: data.accelerator,
      executionProvider: data.execution_provider,
      engineLabel: this.label,
    };
  }

  dispose() {
    this.health = null;
  }
}
