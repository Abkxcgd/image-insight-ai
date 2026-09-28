# Benchmarking methodology

## Principles

1. No number appears anywhere in this project unless it was measured on the
   machine running the app.
2. No cloud comparison is shown, because no cloud inference path is
   implemented.
3. Browser demo mode is reported as a reference row, never as NPU inference.

## What is measured

Latency covers **model execution only**:

* sidecar: `time.perf_counter()` around `session.run(...)`
* browser: `performance.now()` around `model.classify(...)`

Image decoding, resizing, normalisation and HTTP transport are excluded so the
two paths are comparable. Warm-up is reported separately and never folded into
the average.

## Procedure

1. Open `/benchmark` in the app.
2. Choose one image and keep it fixed across all runs.
3. Set the run count (default 20, max 200).
4. Run the local service path; run browser demo mode for reference.
5. To compare NPU against CPU, restart the sidecar with `--cpu` and run again:

```bash
python local-inference/server.py --model models/mobilenet_v2.onnx          # NPU if available
python local-inference/server.py --model models/mobilenet_v2.onnx --cpu    # CPU baseline
```

`scripts/verify_npu.py` performs the same NPU-vs-CPU comparison outside the UI
and additionally reports node placement per execution provider.

## Reporting

Record, alongside every result: device model, SoC, Windows build, ONNX Runtime
version, QNN backend, model file and precision, run count, power profile
(plugged in vs battery), and whether the machine was otherwise idle. Latency on
mobile silicon varies with thermal and power state; a single number without
this context is not a claim worth making.
