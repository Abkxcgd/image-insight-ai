# Phase 1 — Repository audit & Snapdragon architecture proposal

No files changed yet. This is the audit + plan; approve before Phase 2 begins.

## 1. Repository audit

**Folder structure** — `src/components` (14 app components + shadcn `ui/`), `src/pages/Home.tsx`, `src/hooks`, `src/utils`, `src/routes` (`__root`, `index`, `settings`), `src/styles.css`, plus `src/router.tsx`, `src/server.ts`, `src/start.ts`.

**Frontend architecture** — React 19 + TypeScript strict, Vite, TanStack Start/Router (file-based routes, SSR-capable), Tailwind v4 with semantic tokens, Framer Motion, sonner toasts, lucide icons. `Home.tsx` composes Hero, Classifier, Features, HowItWorks, AboutModel, HistoryPanel, FAQ, Footer.

**TensorFlow.js / MobileNet** — `src/hooks/useImageClassifier.ts`. Lazily `import()`s `@tensorflow/tfjs` + `@tensorflow-models/mobilenet`, `mobilenet.load({version:2, alpha:1.0})`, keeps the model in a ref, exposes `classify/predictions/inferenceMs/isModelLoading/isClassifying/error/reset`. Model name is a hardcoded constant.

**Inference pipeline** — file → `validateImage` (type + 10 MB cap) → `compressImage` (browser-image-compression, 1600px/1 MB) → `fileToImage` → `toThumbnail` (canvas 256px JPEG) → `classify(img, 5)` → top-5 → history entry + toast.

**Webcam pipeline** — `CameraCapture.tsx` modal, `getUserMedia({facingMode})`, front/back toggle, canvas grab → JPEG `File` → same `handleFile` path. Single-shot only, no continuous frames.

**Local history** — `useHistory.ts`, localStorage key `visionai:history`, 20-entry cap, thumbnail + predictions + latency + model name, cross-tab `storage` sync, add/remove/clear.

**Performance measurement** — `performance.now()` around `model.classify` only; excludes preprocessing and model load. No warm-up, no repeats, no statistics.

**Dependencies of note** — tfjs 4.22, @tensorflow-models/mobilenet 2.1.1, framer-motion, jspdf, browser-image-compression, sonner, full Radix/shadcn set, TanStack Router/Start/Query.

**Worth preserving as-is** — Hero, Features, FAQ, Footer, HowItWorks, LoadingSkeleton, `utils/image.ts`, `utils/pdf.ts`, CameraCapture shell, HistoryPanel, design tokens.

**Needs modification** — `useImageClassifier` (becomes an engine-agnostic hook), `Classifier` (engine selection + status), `PredictionList` (show real backend/runtime), `useHistory` (record engine/EP/model per entry), `AboutModel` (real model metadata), `settings` (engine preference), `Navbar` (new routes), README.

## 2. Proposed architecture

```text
Image Insight AI UI (React, this repo)
   |  InferenceEngine adapter interface
   +-- BrowserInferenceEngine   -> TF.js MobileNet v2 (WebGL)  [labelled "Browser demo mode"]
   +-- LocalServiceEngine       -> HTTP/WS to 127.0.0.1 sidecar
                                     |
                                     ONNX Runtime (QNN EP -> Snapdragon NPU,
                                                   CPU EP fallback)
                                     Qualcomm AI Hub optimized model
```

Repo layout (additive, existing Vite app stays at root so Lovable preview keeps working):

```text
src/lib/inference/   engine.ts (interface + types), browser-engine.ts,
                     local-service-engine.ts, registry.ts
local-inference/     Python sidecar (FastAPI + onnxruntime-qnn)
models/              downloaded AI Hub .onnx (git-ignored) + model-card.json
docs/                snapdragon-architecture, ai-hub-integration, benchmarking,
                     development-process, challenge-story
scripts/             setup + model-download + NPU verification scripts
```

`InferenceEngine`: `id`, `init()`, `classify(input): {predictions, latencyMs}`, `getRuntimeInfo(): {processing, accelerator, runtime, executionProvider, model, modelVersion, inputShape, precision, source, license, verified}`, `benchmark(input, runs)`, `dispose()`. Every status field the UI shows comes from the backend response; anything the backend does not report renders as "NPU status unavailable" / "unknown" — never inferred, never hardcoded.

## 3. Qualcomm model candidate

Primary: **MobileNet-v2** from Qualcomm AI Hub, exported for **ONNX Runtime / QNN EP on Windows 11 ARM64**, matching the AI Hub "Image Classification Windows" reference app which is explicitly ONNX Runtime + QNN EP based [2](https://aihub.qualcomm.com/apps/image_classification_windows_cpp). Backup if quantized MobileNet-v2 misbehaves on the target chip: **MobileNet-v3-Large** or **ResNet18**, same app family.

Before any code depends on it, Phase 3/4 verifies on the actual machine: exact Snapdragon SoC, Windows ARM64 build, AI Hub export target device match, ORT + QNN EP versions, input tensor layout/shape/normalization, output shape and label ordering, precision (fp32 vs w8a8), and model license. Selection is not final until the model runs on the user's PC.

## 4. Dependencies (user's Snapdragon Windows PC)

Python 3.11/3.12 ARM64; `onnxruntime-qnn` (ARM64 wheel, ships QNN libs); `qai-hub` + `qai-hub-models` (model export, needs a free AI Hub token); FastAPI + uvicorn; numpy, Pillow. Optional C++ path via the AI Hub sample app. Nothing Qualcomm-specific is added to the web app's npm dependencies.

## 5. Frontend ↔ backend communication

Sidecar binds `127.0.0.1` only, loopback CORS allowlist, local token, no external egress. Endpoints: `GET /health` (runtime + EP + model + device info), `POST /classify` (image bytes → top-k + latency + EP actually used), `POST /benchmark` (runs, warm-up, min/avg/max, throughput), `GET /device`. Webcam uses repeated `/classify` posts of JPEG frames. Browser reaches it via `fetch` from the client only. Caveat to accept up front: the Lovable-hosted preview is HTTPS, so mixed-content blocks plain-HTTP loopback calls — the Snapdragon path is exercised by running the frontend locally (`vite dev`) on the PC, or by giving the sidecar a local TLS cert. Hosted preview then shows "Browser demo mode".

**Language:** Python for the sidecar (fastest correct path to onnxruntime-qnn, AI Hub tooling is Python-first), with the C++ AI Hub sample kept as a documented alternative.

## 6. NPU verification (no guessing)

Sidecar reports `session.get_providers()`, the QNN backend actually selected (HTP vs CPU), node-placement counts from ORT profiling/verbose logs, plus ORT + QNN SDK versions. UI shows NPU only when the sidecar confirms QNNExecutionProvider with the HTP backend; otherwise "Running on CPU fallback" or "NPU status unavailable".

## 7. Risks / blockers

- HTTPS preview cannot call loopback HTTP (mitigation above).
- Quantized AI Hub export may fall back to CPU for some ops — verification reports it rather than hiding it.
- AI Hub account/token needed for export; model license must be checked before redistribution (models stay git-ignored).
- Requires the actual Snapdragon PC for Phases 3–5; I cannot measure NPU numbers from this sandbox, so all benchmark values must be produced on the user's machine.
- Rebrand touches names/keys (`visionai:history` → migrated key).

## 8. Phase plan

P2 engine abstraction + browser engine behind it (UI unchanged in behaviour) · P3 sidecar scaffold, setup/verify scripts, docs · P4 AI Hub model export + validation on the PC · P5 real local inference through the sidecar · P6 wire `LocalServiceEngine` + auto-detect/health polling · P7 Snapdragon status panel, offline/online indicator, honest fallback labels · P8 benchmark route (warm-up, min/avg/max, NPU vs CPU) · P9 webcam through the active engine · P10 privacy dashboard, model info, rebrand, "Describe detected scene" only if a local model supports it · P11 testing · P12 docs + submission assets.

Approve and I start Phase 2.
