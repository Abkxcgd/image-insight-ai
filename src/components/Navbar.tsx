import { Moon, Sun, Sparkles } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

// Sticky navbar with brand + dark mode toggle.
export function Navbar() {
  const { isDark, toggle } = useDarkMode();
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Vision<span className="gradient-text">AI</span>
          </span>
        </a>
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="glass grid h-10 w-10 place-items-center rounded-full transition hover:scale-105"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
