# Image Insight AI — Snapdragon Edition

**Private AI Vision, Accelerated on Snapdragon.**

On-device image intelligence that runs in the browser today and on the
Snapdragon NPU through ONNX Runtime + the QNN Execution Provider on a Windows
on Snapdragon PC. Images never leave the device.

## 1. The original Image Insight AI

A browser-based vision app: drag-and-drop or webcam input, MobileNet v2 via
TensorFlow.js, top-5 predictions with confidence bars, inference timing, local
history with thumbnails, PDF reports, dark mode, responsive and accessible UI.
All of that is preserved.

## 2. Why Snapdragon optimization was needed

Browser WebGL inference is portable but leaves the dedicated AI accelerator
idle, cannot report what hardware actually ran the model, and depends on
fetching model weights over the network on first use. Snapdragon PCs ship an
NPU designed for exactly this workload.

## 3. What changed

* An `InferenceEngine` adapter (`src/lib/inference`) sits between the UI and
  any backend: `BrowserInferenceEngine`, `LocalServiceEngine`.
* A local inference service (`local-inference/server.py`) runs ONNX Runtime
  with the QNN EP and a CPU fallback.
* A runtime status panel, privacy dashboard, model information panel and a
  `/benchmark` screen, all fed by real backend data.
* Export and verification scripts under `scripts/`.

## 4. Qualcomm AI Hub integration

MobileNet-v2 exported from Qualcomm AI Hub for ONNX Runtime on the target
Snapdragon device. Full compatibility checklist and export commands:
[`docs/ai-hub-integration.md`](docs/ai-hub-integration.md).

## 5. ONNX Runtime

The sidecar creates an `InferenceSession` and reports
`onnxruntime.__version__`, the activated providers and the model's real input
shape to the UI.

## 6. QNN Execution Provider

Requested as `QNNExecutionProvider` with `backend_path: QnnHtp.dll`, with
`CPUExecutionProvider` behind it.

## 7. NPU execution

Reported as NPU **only** when ONNX Runtime confirms the QNN EP is active.
Verify independently with `python scripts/verify_npu.py`, which prints
providers, node placement per provider and back-to-back QNN vs CPU latency.

## 8. CPU fallback

If QNN initialisation fails, the session is rebuilt on the CPU provider and
the UI shows "Running on CPU fallback". If the sidecar itself is unreachable,
the app runs "Browser demo mode" and says so. Neither is ever presented as NPU
inference.

## 9. Privacy architecture

* Inference is local in every mode — browser tab or loopback service.
* The sidecar binds `127.0.0.1`, accepts loopback origins only, and makes no
  outbound requests.
* Uploads are type-checked and capped at 10 MB; frames are posted under a
  fixed filename, so the original filename is never transmitted.
* History and thumbnails live in browser local storage and can be cleared in
  Settings. No accounts, no analytics, no API keys in the frontend.

## 10. Benchmark methodology

See [`docs/benchmarking.md`](docs/benchmarking.md). Model-execution time only,
warm-up reported separately, fixed image, configurable run count. **No
performance claims are published until measured on the target device.**

## 11. Setup

Frontend (any machine):

```bash
bun install
bun run dev        # http://localhost:8080
```

Local inference service (Windows on Snapdragon, Python 3.11/3.12 ARM64):

```bash
python -m venv .venv && .venv\Scripts\activate
pip install -r local-inference/requirements.txt
```

## 12. Running on a Snapdragon Windows PC

```bash
pip install qai-hub qai-hub-models
qai-hub configure --api_token <YOUR_TOKEN>
python scripts/export_model.py --device "<your AI Hub device name>"
python scripts/verify_npu.py --model models/mobilenet_v2.onnx
python local-inference/server.py --model models/mobilenet_v2.onnx
```

Then start the frontend **on the same machine** and open
`http://localhost:8080`. Settings → Inference engine → "Local (Snapdragon)".
A hosted HTTPS deployment cannot reach a plain-HTTP loopback service
(mixed content), so the Snapdragon path is demonstrated locally or with TLS
on the sidecar.

## Documentation

* [Snapdragon architecture](docs/snapdragon-architecture.md)
* [AI Hub integration](docs/ai-hub-integration.md)
* [Benchmarking](docs/benchmarking.md)
* [Development process](docs/development-process.md)
* [Challenge story](docs/challenge-story.md)

## Tech stack

React 19 · TypeScript (strict) · Vite · TanStack Start/Router · Tailwind CSS v4
· Framer Motion · TensorFlow.js (demo mode) · ONNX Runtime + QNN EP · FastAPI

## License

MIT for the application code. Model licenses are set by their source — check
the Qualcomm AI Hub model page before redistribution.
