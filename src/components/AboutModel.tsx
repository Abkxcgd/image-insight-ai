import { Brain, Gauge, Database, Layers } from "lucide-react";

// Section describing the MobileNet v2 model powering the app.
export function AboutModel() {
  const stats = [
    { icon: Brain, label: "Architecture", value: "MobileNet v2" },
    { icon: Layers, label: "Depth multiplier", value: "α = 1.0" },
    { icon: Database, label: "Trained on", value: "ImageNet · 1000 classes" },
    { icon: Gauge, label: "Backend", value: "TensorFlow.js · WebGL" },
  ];
  return (
    <section id="model" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="glass overflow-hidden rounded-3xl p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              About the model
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              MobileNet <span className="gradient-text">v2</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              MobileNet v2 is a lightweight convolutional neural network designed
              by Google Research for on-device vision tasks. It uses inverted
              residuals and linear bottlenecks to deliver strong ImageNet accuracy
              while staying small enough to run smoothly in a browser tab.
            </p>
            <p className="mt-3 text-muted-foreground">
              Because inference runs entirely on your device with WebGL
              acceleration, your images never touch a server. Predictions are
              fast, private, and free.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-muted/60 p-4">
                <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-base font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
