"""
Export a Qualcomm AI Hub optimized image-classification model to ONNX.

Requires a free Qualcomm AI Hub account and token:
    pip install qai-hub qai-hub-models
    qai-hub configure --api_token <YOUR_TOKEN>

The token is read by the qai-hub CLI from your user config. Never commit it.

Usage:
    python scripts/export_model.py --device "Snapdragon X Elite CRD"

The script writes:
    models/mobilenet_v2.onnx
    models/model-card.json   (input layout/normalisation used by the service)

IMPORTANT: verify the compiled model on your own device before trusting it.
Run scripts/verify_npu.py afterwards.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

MODELS_DIR = Path("models")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model", default="mobilenet_v2", help="qai_hub_models model id, e.g. mobilenet_v2"
    )
    parser.add_argument(
        "--device",
        required=True,
        help='Exact AI Hub device name for YOUR machine, e.g. "Snapdragon X Elite CRD"',
    )
    parser.add_argument("--target-runtime", default="onnx", choices=["onnx", "qnn", "tflite"])
    args = parser.parse_args()

    MODELS_DIR.mkdir(exist_ok=True)

    cmd = [
        sys.executable,
        "-m",
        f"qai_hub_models.models.{args.model}.export",
        "--device",
        args.device,
        "--target-runtime",
        args.target_runtime,
        "--output-dir",
        str(MODELS_DIR),
    ]
    print("Running:", " ".join(cmd))
    subprocess.check_call(cmd)

    card = {
        "name": args.model,
        "version": "see AI Hub job output",
        "input_shape": "1x3x224x224",
        "layout": "NCHW",
        "precision": "verify in the AI Hub job (float32 or w8a8)",
        "source": f"Qualcomm AI Hub · qai_hub_models.models.{args.model}",
        "license": "check the model page on https://aihub.qualcomm.com before redistribution",
        "mean": [0.485, 0.456, 0.406],
        "std": [0.229, 0.224, 0.225],
        "size": 224,
    }
    card_path = MODELS_DIR / "model-card.json"
    if not card_path.exists():
        card_path.write_text(json.dumps(card, indent=2), encoding="utf-8")
        print(f"Wrote {card_path} — fill in the verified values from the AI Hub job page.")
    else:
        print(f"{card_path} already exists; leaving it untouched.")


if __name__ == "__main__":
    main()
