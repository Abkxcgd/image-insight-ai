# Development process

The upgrade runs in phases. Phases 4 and 5 require physical access to the
Snapdragon Windows PC and cannot be completed from a cloud build environment.

| Phase | Work | Status |
| --- | --- | --- |
| 1 | Repository audit + architecture proposal | Done |
| 2 | `InferenceEngine` abstraction, browser engine moved behind it | Done |
| 3 | Local inference service scaffold, export/verify scripts, docs | Done |
| 4 | Export and validate the Qualcomm AI Hub model | Needs the Snapdragon PC |
| 5 | First real ONNX Runtime + QNN inference run | Needs the Snapdragon PC |
| 6 | Frontend wired to the local service, auto-detect + health probe | Done |
| 7 | NPU/CPU status detection surfaced in the UI | Done |
| 8 | Benchmark screen (`/benchmark`) | Done |
| 9 | Webcam frames routed through the active engine | Done |
| 10 | Privacy dashboard, model info, rebrand | Done |
| 11 | Testing on device | Needs the Snapdragon PC |
| 12 | Documentation and submission assets | In progress |

## Phase 1 audit summary

The original app was a React 19 + TypeScript + Vite + TanStack Start SPA with
a single `useImageClassifier` hook that loaded `@tensorflow-models/mobilenet`
directly. Upload, compression, thumbnailing, webcam capture, local history,
PDF export and the glassmorphism design system were all worth preserving; only
the inference call site and the places that displayed model/runtime facts
needed to change.

## Phase 2 notes

`useImageClassifier` no longer imports TensorFlow. It resolves an engine from
the registry and exposes `runtimeInfo` plus `fellBackToBrowser`, so every
component that displays hardware facts reads them from the backend that ran
the model.

## What to do next on the device

```bash
python -m venv .venv && .venv\Scripts\activate
pip install -r local-inference/requirements.txt
pip install qai-hub qai-hub-models
qai-hub configure --api_token <token>
python scripts/export_model.py --device "<your AI Hub device name>"
python scripts/verify_npu.py --model models/mobilenet_v2.onnx
python local-inference/server.py --model models/mobilenet_v2.onnx
bun run dev    # in another terminal, then open http://localhost:8080
```
