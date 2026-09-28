# Qualcomm AI Hub integration

## Why AI Hub

Qualcomm AI Hub publishes vision models already compiled and profiled for
Snapdragon targets, including an ONNX Runtime + QNN EP Windows image
classification reference app. We export an existing optimized model rather
than training one.

## Candidate model

**Primary:** MobileNet-v2 (ImageNet, 1000 classes) — the same family the app
already used in the browser, so labels and UX carry over unchanged.

**Backups if the primary does not compile cleanly for the target:**
MobileNet-v3-Large, ResNet18.

## Compatibility checklist — complete before trusting the model

Do not assume a model works because it exists in AI Hub. Record each answer in
`models/model-card.json`:

- [ ] Exact Snapdragon SoC of the target PC (`scripts/verify_npu.py` prints it)
- [ ] Windows 11 ARM64 confirmed
- [ ] AI Hub device name matches the target chip
- [ ] Target runtime = ONNX, and ONNX Runtime version supports the QNN EP
- [ ] QNN SDK / `onnxruntime-qnn` version pairing
- [ ] Input tensor: shape, layout (NCHW/NHWC), dtype, normalisation (mean/std)
- [ ] Output tensor: shape, whether logits or softmax, label ordering
- [ ] Precision: float32 or quantized (w8a8) — quantized is usually required
      for full HTP offload
- [ ] Model license permits your intended use and redistribution

## Export

```bash
python -m pip install qai-hub qai-hub-models
qai-hub configure --api_token <YOUR_TOKEN>      # never commit this token
python scripts/export_model.py --device "<exact AI Hub device name>"
```

Then fill in the verified values in `models/model-card.json`. The sidecar reads
that file for preprocessing **and** for everything the UI displays about the
model, so wrong values there become wrong claims in the UI.

## Verify

```bash
python scripts/verify_npu.py --model models/mobilenet_v2.onnx
```

The script prints available providers, whether the QNN session opened with
`QnnHtp.dll`, per-provider node counts from an ONNX Runtime profile, and
measured latency for both QNN and CPU sessions. If the QNN session fails, the
app must keep reporting CPU fallback — do not work around it in the UI.

## Secrets

The AI Hub token lives in the `qai-hub` CLI user config, never in the repo, and
never in frontend code. Model binaries are git-ignored.
