# VisionAI 🔮

A production-ready, privacy-first **AI image classification** web app that runs entirely in your browser. Drop, browse, or snap a photo — get instant top‑5 predictions with confidence bars. Nothing is uploaded. Ever.

![Stack](https://img.shields.io/badge/React-19-61dafb) ![TS](https://img.shields.io/badge/TypeScript-strict-3178c6) ![Vite](https://img.shields.io/badge/Vite-7-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8) ![TF.js](https://img.shields.io/badge/TensorFlow.js-MobileNet%20v2-ff6f00)

## ✨ Features

- 🖼️ **Drag & drop, click, or camera capture** — JPG / PNG / WEBP / GIF up to 10 MB
- 🧠 **On-device inference** using pretrained **MobileNet v2 (α = 1.0)**
- 🏆 **Top‑5 predictions** with animated confidence bars and inference timing (ms)
- 🕘 **Prediction history** stored locally (up to 20 entries) with thumbnails
- 📄 **Export as PDF** — one-click branded report of your predictions
- 🔗 **Share & copy** results (Web Share API with clipboard fallback)
- 📷 **Webcam capture** with front/back camera toggle
- 🖼️ **Automatic image compression** before inference (browser-image-compression)
- 🎬 **Framer Motion** animations and smooth micro-interactions
- 💎 **Apple-inspired glassmorphism** UI with animated gradient blobs
- 🌗 **Dark mode** with system preference detection
- ⚙️ **Settings page** — theme, clear history, model info
- ❓ **FAQ** and contact-rich footer
- 🔔 **Sonner toast notifications** for every action
- ♿ **Accessibility**: aria-labels, keyboard focus, semantic HTML
- 📱 **Fully responsive** — mobile-first design
- ⚡ **Lazy-loaded** TensorFlow.js and MobileNet — minimal initial bundle
- 🛡️ **Robust error handling** for unsupported files, camera errors, model failures

## 🧰 Tech Stack

- **React 19** + **TypeScript** (strict) + **TanStack Router / Start**
- **Vite 7** + **Tailwind CSS v4** (CSS-first tokens, semantic color system)
- **TensorFlow.js** + **@tensorflow-models/mobilenet**
- **Framer Motion**, **lucide-react**, **sonner**
- **jspdf**, **browser-image-compression**

## 📁 Folder Structure

```
src/
├── components/       # Navbar, Hero, Classifier, PredictionList, HowItWorks,
│                     # AboutModel, FAQ, HistoryPanel, CameraCapture, Footer, ...
├── pages/            # Home
├── hooks/            # useDarkMode, useImageClassifier, useHistory
├── utils/            # image (validate/compress/thumbnail), pdf
├── routes/           # __root, index, settings   (TanStack file-based routing)
└── styles.css        # Design tokens & glass / gradient utilities
```

## 🚀 Getting Started

```bash
bun install
bun run dev
```

Open http://localhost:8080 and drop an image — or hit **Use camera**.

## 🧪 How It Works

1. On first interaction, **MobileNet v2** (~16 MB) is lazily fetched and initialised on the WebGL backend.
2. Uploaded images are auto-compressed (max 1600px, ~1 MB) before decoding into an `HTMLImageElement`.
3. The model runs inference locally, timed with `performance.now()`.
4. Top‑5 predictions render with animated confidence bars.
5. Each classification is saved to `localStorage` with a JPEG thumbnail.
6. Reports can be exported as branded PDFs via `jsPDF`.

Your images **never leave your device**. 🔒

## ⚙️ Settings

Visit `/settings` to toggle dark mode, view model info, and clear your prediction history.

## 📜 License

MIT — do whatever makes you happy.
