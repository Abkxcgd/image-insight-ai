import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Image Insight AI — Private AI Vision, Accelerated on Snapdragon" },
      {
        name: "description",
        content:
          "On-device image classification with top-5 predictions, real runtime and accelerator reporting, benchmarking and a privacy dashboard. Nothing is uploaded.",
      },
      {
        property: "og:title",
        content: "Image Insight AI — Snapdragon Edition",
      },
      {
        property: "og:description",
        content:
          "Private AI vision on your own device: ONNX Runtime with the QNN execution provider, honest NPU/CPU status and measured benchmarks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
