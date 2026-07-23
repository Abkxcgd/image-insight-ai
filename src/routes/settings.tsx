import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Moon, Sun, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useHistory } from "@/hooks/useHistory";
import { Switch } from "@/components/ui/switch";
import { MODEL_NAME } from "@/hooks/useImageClassifier";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — VisionAI" },
      {
        name: "description",
        content: "Manage your VisionAI preferences: dark mode, prediction history, and more.",
      },
      { property: "og:title", content: "Settings — VisionAI" },
      { property: "og:description", content: "Manage VisionAI preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { isDark, toggle } = useDarkMode();
  const { entries, clear } = useHistory();

  const handleClear = () => {
    clear();
    toast.success("Prediction history cleared");
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="gradient-text">Settings</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Personalise VisionAI. Everything stays in your browser.
        </p>

        <div className="mt-8 space-y-4">
          {/* Appearance */}
          <section className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Appearance
            </h2>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
                  {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">Dark mode</p>
                  <p className="text-xs text-muted-foreground">
                    Switch between light and dark themes.
                  </p>
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={toggle} aria-label="Toggle dark mode" />
            </div>
          </section>

          {/* Data */}
          <section className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Data
            </h2>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Prediction history</p>
                  <p className="text-xs text-muted-foreground">
                    {entries.length} entr{entries.length === 1 ? "y" : "ies"} stored locally.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                disabled={entries.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          </section>

          {/* About */}
          <section className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h2>
            <div className="mt-4 flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted">
                <Info className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <p className="font-semibold">VisionAI</p>
                <p className="text-muted-foreground">
                  Powered by {MODEL_NAME}. All inference happens on your device.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
