import { Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p className="flex items-center gap-1.5">
          Built with <Heart className="h-3.5 w-3.5 fill-accent text-accent" /> using
          TensorFlow.js
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://www.tensorflow.org/js"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition"
          >
            TensorFlow.js
          </a>
          <a
            href="https://github.com/tensorflow/tfjs-models/tree/master/mobilenet"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition"
          >
            <Github className="h-3.5 w-3.5" /> MobileNet
          </a>
        </div>
      </div>
    </footer>
  );
}
