# VisionAI 🔮

A modern, privacy-first **AI image classification** web app that runs entirely in your browser. Drop any photo and instantly get the top‑5 predictions with confidence scores — no uploads, no backend, no tracking.

![Stack](https://img.shields.io/badge/React-19-61dafb) ![TS](https://img.shields.io/badge/TypeScript-strict-3178c6) ![Vite](https://img.shields.io/badge/Vite-7-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8) ![TF.js](https://img.shields.io/badge/TensorFlow.js-MobileNet-ff6f00)

## ✨ Features

- 🖼️ **Drag & drop or click to upload** any JPG/PNG/WEBP
- 🧠 **On-device inference** using the pretrained **MobileNet v2** model
- 🏆 **Top‑5 predictions** with animated confidence bars
- 🌗 **Light / dark mode** with system preference detection
- 🪟 **Glassmorphism UI** with animated gradient blobs
- 📱 **Fully responsive** — mobile-first design
- ⚡ **Zero backend** — everything runs client-side via WebGL
- 🛡️ **Robust error handling** for unsupported files and model failures

## 🧰 Tech Stack

- **React 19** + **TypeScript** (strict)
- **Vite 7** + **TanStack Start / Router**
- **Tailwind CSS v4** (CSS-first design tokens, semantic color system)
- **TensorFlow.js** + **@tensorflow-models/mobilenet**
- **lucide-react** icons

## 📁 Folder Structure

```
src/
├── components/       # Reusable UI: Navbar, Hero, Features, Classifier, PredictionList, Footer
├── pages/            # Page-level compositions (Home)
├── hooks/            # useDarkMode, useImageClassifier
├── utils/            # image validation & helpers
├── routes/           # File-based routes (TanStack Router)
└── styles.css        # Design system tokens & glass utilities
```

## 🚀 Getting Started

```bash
bun install
bun run dev
```

Open http://localhost:8080 and drop an image onto the classifier.

## 🧪 How It Works

1. On first load, **MobileNet v2** (~16MB) is fetched and initialized on the WebGL backend.
2. When you drop an image, it's decoded into an `HTMLImageElement`.
3. The model runs inference locally and returns the top‑5 ImageNet class predictions with probabilities.
4. Results are rendered with animated confidence bars.

Your images **never leave your device**. 🔒

## 📜 License

MIT — do whatever makes you happy.
