# Challenge story — Snapdragon AI Lab Build & Present Challenge 2026

## Problem

Cloud-based image analysis can require sending visual data away from the
device and introduces a network dependency. For photos of documents, people,
medical items or workplaces, "upload it to analyse it" is often the wrong
trade.

## Existing solution

Image Insight AI already provided browser-based local image classification:
drag-and-drop or webcam input, top-5 predictions with confidence scores,
inference timing, local history and PDF reports — with no uploads. It ran
MobileNet v2 through TensorFlow.js on WebGL.

## Transformation

The project is being redesigned for hardware-accelerated on-device AI on
Snapdragon PCs. The browser inference call was replaced with an
`InferenceEngine` adapter, and a local inference service was added that runs a
Qualcomm AI Hub optimized ONNX model through ONNX Runtime with the QNN
Execution Provider, falling back to the CPU provider when QNN is unavailable.

## Innovation

* One UI, swappable backends: browser demo mode, local NPU, local CPU.
* A runtime status contract: the frontend displays only what the backend
  reports. If QNN did not initialise, the app says "Running on CPU fallback";
  if the accelerator cannot be determined, it says "NPU status unavailable".
* A benchmark screen that measures warm-up, min/avg/max latency and throughput
  per execution path on the user's own machine.

## Impact

Private, local, low-latency computer vision that keeps working offline once
the model and runtime are installed — with the hardware story stated honestly
rather than asserted.

## Measurement status

No performance improvement is claimed yet. Latency figures will be published
only after they are measured on the target Snapdragon PC using the procedure
in `docs/benchmarking.md`.
