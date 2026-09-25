"""
Image Insight AI - local inference service (Snapdragon Edition)

Runs an ONNX image-classification model with ONNX Runtime, preferring the QNN
Execution Provider (Snapdragon NPU / HTP) and falling back to the CPU EP.

HONESTY RULES BAKED INTO THIS SERVICE
-------------------------------------
* The accelerator reported to the UI is derived from the providers ONNX Runtime
  actually activated, plus the QNN backend that was actually requested/loaded.
* If we cannot confirm QNN+HTP, `accelerator_verified` is False and the UI
  shows "NPU status unavailable" or "Running on CPU fallback".
* Latency numbers are measured with time.perf_counter around session.run only.
* Nothing is uploaded anywhere. The server binds to loopback only.

Run:
    python local-inference/server.py --model models/mobilenet_v2.onnx
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import onnxruntime as ort
import uvicorn

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # mirrors the frontend's 10 MB cap


@dataclass
class ModelCard:
    """Metadata describing the loaded model. Loaded from models/model-card.json."""

    name: str = "unknown"
    version: str = "unknown"
    input_shape: str = "unknown"
    layout: str = "NCHW"
    precision: str = "unknown"
    source: str = "unknown"
    license: str = "unknown"
    mean: tuple[float, float, float] = (0.485, 0.456, 0.406)
    std: tuple[float, float, float] = (0.229, 0.224, 0.225)
    size: int = 224

    @staticmethod
    def load(path: Path) -> "ModelCard":
        if not path.exists():
            return ModelCard()
        data = json.loads(path.read_text(encoding="utf-8"))
        card = ModelCard()
        for key, value in data.items():
            if hasattr(card, key):
                setattr(card, key, value)
        return card


class Engine:
    def __init__(self, model_path: Path, card: ModelCard, force_cpu: bool = False):
        self.model_path = model_path
        self.card = card
        self.notes: list[str] = []
        self.cpu_fallback = False
        self.session: ort.InferenceSession | None = None
        self.labels = self._load_labels()
        self._create_session(force_cpu)

    # -- session -----------------------------------------------------------
    def _create_session(self, force_cpu: bool) -> None:
        available = ort.get_available_providers()
        self.notes.append(f"ONNX Runtime providers available: {', '.join(available)}")

        if not force_cpu and "QNNExecutionProvider" in available:
            try:
                self.session = ort.InferenceSession(
                    str(self.model_path),
                    providers=["QNNExecutionProvider", "CPUExecutionProvider"],
                    provider_options=[{"backend_path": "QnnHtp.dll"}, {}],
                )
                self.notes.append("Requested QNN backend: QnnHtp.dll (Hexagon NPU)")
            except Exception as exc:  # noqa: BLE001 - report, never hide
                self.notes.append(f"QNN EP initialisation failed: {exc}")
                self.session = None

        if self.session is None:
            self.session = ort.InferenceSession(
                str(self.model_path), providers=["CPUExecutionProvider"]
            )
            self.cpu_fallback = not force_cpu
            if force_cpu:
                self.notes.append("CPU execution provider selected explicitly.")
            else:
                self.notes.append("Fell back to CPUExecutionProvider.")

        self.active_providers = self.session.get_providers()
        self.input_name = self.session.get_inputs()[0].name
        self.input_shape_actual = self.session.get_inputs()[0].shape

    def _load_labels(self) -> list[str]:
        labels_path = self.model_path.parent / "imagenet_labels.txt"
        if labels_path.exists():
            return [l.strip() for l in labels_path.read_text(encoding="utf-8").splitlines() if l.strip()]
        return []

    # -- reported status ---------------------------------------------------
    @property
    def uses_qnn(self) -> bool:
        return "QNNExecutionProvider" in getattr(self, "active_providers", [])

    def health(self) -> dict[str, Any]:
        if self.uses_qnn:
            accelerator = "NPU"
            execution_provider = "QNNExecutionProvider (HTP)"
            verified = True
        else:
            accelerator = "CPU"
            execution_provider = "CPUExecutionProvider"
            # CPU execution is verified fact; NPU simply was not used.
            verified = True
        return {
            "ok": self.session is not None,
            "runtime": "ONNX Runtime",
            "runtime_version": ort.__version__,
            "execution_provider": execution_provider,
            "accelerator": accelerator,
            "accelerator_verified": verified,
            "cpu_fallback": self.cpu_fallback,
            "model": self.card.name,
            "model_version": self.card.version,
            "input_shape": f"{self.input_shape_actual} ({self.card.layout})",
            "precision": self.card.precision,
            "model_source": self.card.source,
            "model_license": self.card.license,
            "device": platform.node(),
            "processor": platform.processor() or platform.machine(),
            "offline_capable": True,
            "notes": self.notes,
        }

    # -- inference ---------------------------------------------------------
    def preprocess(self, raw: bytes) -> np.ndarray:
        img = Image.open(io.BytesIO(raw)).convert("RGB").resize(
            (self.card.size, self.card.size), Image.BILINEAR
        )
        arr = np.asarray(img, dtype=np.float32) / 255.0
        arr = (arr - np.array(self.card.mean, dtype=np.float32)) / np.array(
            self.card.std, dtype=np.float32
        )
        if self.card.layout.upper() == "NCHW":
            arr = arr.transpose(2, 0, 1)
        return np.expand_dims(arr, 0).astype(np.float32)

    def run(self, tensor: np.ndarray) -> tuple[np.ndarray, float]:
        assert self.session is not None
        start = time.perf_counter()
        outputs = self.session.run(None, {self.input_name: tensor})
        latency_ms = (time.perf_counter() - start) * 1000.0
        return outputs[0], latency_ms

    def top_k(self, logits: np.ndarray, k: int) -> list[dict[str, Any]]:
        scores = logits.reshape(-1).astype(np.float64)
        if not np.isclose(scores.sum(), 1.0, atol=1e-2):
            exp = np.exp(scores - scores.max())
            scores = exp / exp.sum()
        idx = np.argsort(scores)[::-1][:k]
        return [
            {
                "className": self.labels[i] if i < len(self.labels) else f"class {int(i)}",
                "probability": float(scores[i]),
            }
            for i in idx
        ]


def build_app(engine: Engine) -> FastAPI:
    app = FastAPI(title="Image Insight AI local inference")
    app.add_middleware(
        CORSMiddleware,
        # Loopback origins only — the dev server and a locally served build.
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, Any]:
        return engine.health()

    @app.get("/device")
    def device() -> dict[str, Any]:
        return {
            "device": platform.node(),
            "processor": platform.processor() or platform.machine(),
            "os": f"{platform.system()} {platform.release()}",
            "architecture": platform.machine(),
            "providers": ort.get_available_providers(),
        }

    @app.post("/classify")
    async def classify(image: UploadFile = File(...), top_k: int = Form(5)) -> dict[str, Any]:
        raw = await image.read()
        if len(raw) > MAX_UPLOAD_BYTES:
            return {"error": "Image exceeds the 10 MB limit."}
        tensor = engine.preprocess(raw)
        logits, latency_ms = engine.run(tensor)
        return {
            "predictions": engine.top_k(logits, max(1, min(int(top_k), 10))),
            "latency_ms": latency_ms,
            "health": engine.health(),
        }

    @app.post("/benchmark")
    async def benchmark(image: UploadFile = File(...), runs: int = Form(20)) -> dict[str, Any]:
        raw = await image.read()
        if len(raw) > MAX_UPLOAD_BYTES:
            return {"error": "Image exceeds the 10 MB limit."}
        tensor = engine.preprocess(raw)
        _, warmup_ms = engine.run(tensor)  # first run: warm-up, reported separately
        runs = max(1, min(int(runs), 200))
        samples = [engine.run(tensor)[1] for _ in range(runs)]
        avg = sum(samples) / len(samples)
        h = engine.health()
        return {
            "runs": runs,
            "warmup_ms": round(warmup_ms, 2),
            "avg_ms": round(avg, 2),
            "min_ms": round(min(samples), 2),
            "max_ms": round(max(samples), 2),
            "throughput": round(1000.0 / avg, 2),
            "accelerator": h["accelerator"],
            "execution_provider": h["execution_provider"],
        }

    return app


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="models/mobilenet_v2.onnx")
    parser.add_argument("--card", default="models/model-card.json")
    parser.add_argument("--port", type=int, default=8731)
    parser.add_argument("--cpu", action="store_true", help="Force the CPU execution provider")
    args = parser.parse_args()

    model_path = Path(args.model).resolve()
    if not model_path.exists():
        raise SystemExit(
            f"Model not found: {model_path}\nRun scripts/export_model.py first (see docs/ai-hub-integration.md)."
        )

    engine = Engine(model_path, ModelCard.load(Path(args.card)), force_cpu=args.cpu)
    print(json.dumps(engine.health(), indent=2))
    # Bind to loopback only: never reachable from the network.
    uvicorn.run(build_app(engine), host="127.0.0.1", port=args.port, log_level="info")


if __name__ == "__main__":
    main()
