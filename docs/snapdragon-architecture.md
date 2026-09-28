# Snapdragon architecture

## Goal

Move vision inference from the browser's TensorFlow.js runtime onto the
Snapdragon AI accelerator on a Windows on Snapdragon PC, without losing the
existing browser experience and without ever claiming acceleration that did
not happen.

## Layers

```text
Image Insight AI UI (React 19 + TanStack Start)
        |
        |  InferenceEngine adapter (src/lib/inference)
        |
        +-- BrowserInferenceEngine   TF.js MobileNet v2   -> "Browser demo mode"
        |
        +-- LocalServiceEngine  --HTTP loopback-->  local-inference/server.py
                                                        |
                                                   ONNX Runtime
                                                        |
                                    QNNExecutionProvider (QnnHtp.dll) -> Hexagon NPU
                                                        |  (on failure)
                                                   CPUExecutionProvider
                                                        |
                                    Qualcomm AI Hub optimized ONNX model
```

## The adapter

`src/lib/inference/types.ts` defines `InferenceEngine`:

| Member | Purpose |
| --- | --- |
| `probe()` | Cheap availability check (sidecar `/health`, or browser support) |
| `init()` | Load the model / open the session |
| `classify(input, topK)` | Returns predictions, measured latency, and runtime info |
| `getRuntimeInfo()` | Device, processor, accelerator, EP, model, precision, license |
| `benchmark(input, runs)` | Warm-up + min/avg/max/throughput |
| `dispose()` | Release resources |

The UI depends only on this interface. Adding a new backend (for example a
native C++ host or a WinML path) means adding one file.

## Engine selection

`src/lib/inference/registry.ts` resolves an engine from the user's preference
(`auto` / `local` / `browser`, stored in local storage):

* `auto` — probe the local service; use it if healthy, otherwise browser demo mode.
* `local` — probe the local service; if unreachable, fall back to the browser
  engine **and flag `fellBack: true`** so the UI says so explicitly.
* `browser` — always browser demo mode.

## Honesty contract

`RuntimeInfo.accelerator` is `null` unless a backend reported it. The status
panel renders `null` as "NPU status unavailable". `acceleratorVerified` is only
true when ONNX Runtime actually activated the provider in question. The browser
engine can report `GPU (WebGL)` / `CPU (WASM)` — never `NPU`.

## Transport

The sidecar binds `127.0.0.1` and allows only `localhost` / `127.0.0.1`
origins. Because a hosted HTTPS page cannot call plain-HTTP loopback
(mixed content), the Snapdragon path is exercised by running the frontend
locally on the PC (`bun run dev`) or by terminating TLS on the sidecar.
The hosted preview therefore shows browser demo mode.

## Endpoints

| Method | Path | Returns |
| --- | --- | --- |
| GET | `/health` | runtime, EP, accelerator, model card, device, notes |
| GET | `/device` | hostname, processor, OS, arch, available providers |
| POST | `/classify` | top-k predictions + measured latency + health |
| POST | `/benchmark` | warm-up, avg, min, max, throughput, EP |
