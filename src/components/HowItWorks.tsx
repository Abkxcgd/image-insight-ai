import { Upload, Cpu, ListChecks, Download } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    icon: Upload,
    title: "Upload or capture",
    body: "Drop an image, browse your files, or take a photo with your webcam.",
  },
  {
    icon: Cpu,
    title: "On-device inference",
    body: "MobileNet v2 runs locally via TensorFlow.js and WebGL — no uploads.",
  },
  {
    icon: ListChecks,
    title: "Top-5 predictions",
    body: "See ranked ImageNet labels with confidence bars in milliseconds.",
  },
  {
    icon: Download,
    title: "Save & share",
    body: "Export a PDF report, copy the result, or share it with one click.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How it <span className="gradient-text">works</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Four simple steps from pixel to prediction.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="glass relative rounded-2xl p-6"
          >
            <div className="absolute -top-3 left-6 rounded-full bg-[image:var(--gradient-primary)] px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-muted">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
