# Models

Model binaries are **not committed** (see `.gitignore`). Generate them on your
Snapdragon Windows PC:

```bash
python scripts/export_model.py --device "<your exact AI Hub device name>"
python scripts/verify_npu.py --model models/mobilenet_v2.onnx
```

Expected contents after export:

| File | Purpose |
| --- | --- |
| `mobilenet_v2.onnx` | The Qualcomm AI Hub optimized classifier |
| `model-card.json` | Verified input size, layout, normalisation, precision, source, license |
| `imagenet_labels.txt` | One class label per line, in model output order |

`model-card.json` drives both preprocessing and everything the UI displays
about the model, so fill it in from the actual AI Hub job output — do not
guess values.
