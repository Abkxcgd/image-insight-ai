import { Zap, Shield, Sparkles, Cpu } from "lucide-react";

// Static feature grid highlighting key capabilities.
const FEATURES = [
  {
    icon: Zap,
    title: "Blazing fast",
    body: "MobileNet v2 runs directly in your browser via WebGL for real-time inference.",
  },
  {
    icon: Shield,
    title: "100% private",
    body: "Nothing is uploaded. Every prediction happens locally on your device.",
  },
  {
    icon: Sparkles,
    title: "Top-5 predictions",
    body: "Get ranked labels with confidence percentages for every image you analyze.",
  },
  {
    icon: Cpu,
    title: "1000 classes",
    body: "Trained on ImageNet, it recognizes a huge variety of everyday objects.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Built for <span className="gradient-text">modern vision</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          A tiny, delightful classifier that gets out of your way.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="glass group relative rounded-2xl p-6 transition hover:-translate-y-1"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
