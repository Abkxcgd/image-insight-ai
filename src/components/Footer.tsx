import { Github, Heart, Mail, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="mt-10 border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight">
            Vision<span className="gradient-text">AI</span>
          </h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Private, on-device image classification powered by MobileNet v2 and
            TensorFlow.js.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#classify" className="hover:text-foreground">Classify</a></li>
            <li><a href="#how" className="hover:text-foreground">How it works</a></li>
            <li><a href="#model" className="hover:text-foreground">About the model</a></li>
            <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Get in touch</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="mailto:hello@visionai.app" className="inline-flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4" /> hello@visionai.app
              </a>
            </li>
            <li>
              <a
                href="https://github.com/tensorflow/tfjs-models/tree/master/mobilenet"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Github className="h-4 w-4" /> MobileNet on GitHub
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Twitter className="h-4 w-4" /> Follow us
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p className="flex items-center gap-1.5">
            Built with <Heart className="h-3.5 w-3.5 fill-accent text-accent" /> using
            TensorFlow.js
          </p>
          <p>© {new Date().getFullYear()} VisionAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
