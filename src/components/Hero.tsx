import { ArrowDown, Sparkles } from "lucide-react";

// Hero: eye-catching intro with animated gradient blobs and CTA.
export function Hero() {
  const scrollToUpload = () => {
    document.getElementById("classify")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section className="relative overflow-hidden">
      {/* Animated blob backdrop */}
      <div className="pointer-events-none absolute inset-0 hero-bg" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/30 blur-3xl animate-blob [animation-delay:-4s]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Powered by MobileNet · Runs in your browser
          </span>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            See what your <span className="gradient-text">images</span> really are.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Drop any photo and get instant AI predictions with confidence scores.
            Zero uploads, zero servers — your images never leave your device.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={scrollToUpload}
              className="group inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground glow transition hover:scale-[1.03]"
            >
              Try it now
              <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
            </button>
            <a
              href="#features"
              className="glass rounded-full px-6 py-3 text-sm font-semibold transition hover:scale-[1.03]"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
