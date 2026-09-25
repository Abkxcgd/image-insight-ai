"""
Prove (or disprove) that inference actually runs on the Snapdragon NPU.

This script makes no claims of its own — it prints what ONNX Runtime reports:
  * available and activated execution providers
  * whether the QNN EP loaded and with which backend
  * how many graph nodes were assigned to QNN vs CPU (from an ORT profile)
  * measured latency for QNN and for CPU, back to back

Usage:
    python scripts/verify_npu.py --model models/mobilenet_v2.onnx
"""

from __future__ import annotations

import argparse
import json
import platform
import time
from collections import Counter
from pathlib import Path

import numpy as np
import onnxruntime as ort


def timed_run(sess: ort.InferenceSession, tensor: np.ndarray, runs: int) -> dict:
    name = sess.get_inputs()[0].name
    sess.run(None, {name: tensor})  # warm-up
    samples = []
    for _ in range(runs):
        t = time.perf_counter()
        sess.run(None, {name: tensor})
        samples.append((time.perf_counter() - t) * 1000)
    return {
        "providers": sess.get_providers(),
        "avg_ms": round(sum(samples) / len(samples), 2),
        "min_ms": round(min(samples), 2),
        "max_ms": round(max(samples), 2),
    }


def node_placement(profile_path: Path) -> dict[str, int]:
    try:
        events = json.loads(profile_path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    counter: Counter[str] = Counter()
    for e in events:
        ep = (e.get("args") or {}).get("provider")
        if ep:
            counter[ep] += 1
    return dict(counter)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="models/mobilenet_v2.onnx")
    parser.add_argument("--runs", type=int, default=30)
    args = parser.parse_args()

    model = Path(args.model)
    if not model.exists():
        raise SystemExit(f"Model not found: {model}")

    print(f"Machine   : {platform.machine()}  ({platform.system()} {platform.release()})")
    print(f"Processor : {platform.processor()}")
    print(f"ORT       : {ort.__version__}")
    print(f"Providers : {ort.get_available_providers()}\n")

    tensor = np.random.rand(1, 3, 224, 224).astype(np.float32)

    report: dict[str, object] = {}

    if "QNNExecutionProvider" in ort.get_available_providers():
        opts = ort.SessionOptions()
        opts.enable_profiling = True
        try:
            qnn = ort.InferenceSession(
                str(model),
                sess_options=opts,
                providers=["QNNExecutionProvider", "CPUExecutionProvider"],
                provider_options=[{"backend_path": "QnnHtp.dll"}, {}],
            )
            report["qnn"] = timed_run(qnn, tensor, args.runs)
            profile = Path(qnn.end_profiling())
            report["qnn"]["node_placement"] = node_placement(profile)  # type: ignore[index]
            profile.unlink(missing_ok=True)
        except Exception as exc:  # noqa: BLE001
            report["qnn"] = {"error": str(exc)}
    else:
        report["qnn"] = {"error": "QNNExecutionProvider not available in this ONNX Runtime build."}

    cpu = ort.InferenceSession(str(model), providers=["CPUExecutionProvider"])
    report["cpu"] = timed_run(cpu, tensor, args.runs)

    print(json.dumps(report, indent=2))
    qnn_report = report.get("qnn", {})
    if isinstance(qnn_report, dict) and "error" not in qnn_report:
        print("\nNPU execution CONFIRMED via QNNExecutionProvider.")
    else:
        print("\nNPU execution NOT confirmed. The app must report CPU fallback.")


if __name__ == "__main__":
    main()
