import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VisionAI — Instant Image Classification in Your Browser" },
      {
        name: "description",
        content:
          "Drop any photo and get instant AI predictions with confidence scores. Powered by MobileNet and TensorFlow.js — runs entirely in your browser.",
      },
      { property: "og:title", content: "VisionAI — Instant Image Classification" },
      {
        property: "og:description",
        content:
          "Private, browser-based image classification with top-5 predictions. No uploads, no servers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
