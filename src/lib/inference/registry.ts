import { BrowserInferenceEngine } from "./browser-engine";
import { LocalServiceEngine, getLocalEndpoint } from "./local-service-engine";
import type { EngineId, InferenceEngine } from "./types";

export type EnginePreference = "auto" | EngineId;

const PREF_KEY = "iiai:engine-preference";

export function getEnginePreference(): EnginePreference {
  if (typeof window === "undefined") return "auto";
  const v = localStorage.getItem(PREF_KEY);
  return v === "browser" || v === "local" || v === "auto" ? v : "auto";
}

export function setEnginePreference(pref: EnginePreference) {
  localStorage.setItem(PREF_KEY, pref);
}

/**
 * Resolve the engine to use. "auto" prefers the native Snapdragon sidecar and
 * falls back to the browser demo engine only when the sidecar is unreachable.
 */
export async function resolveEngine(
  pref: EnginePreference = getEnginePreference(),
): Promise<{ engine: InferenceEngine; fellBack: boolean }> {
  if (pref !== "browser") {
    const local = new LocalServiceEngine(getLocalEndpoint());
    if (await local.probe()) {
      await local.init();
      return { engine: local, fellBack: false };
    }
    if (pref === "local") {
      // Explicitly requested but unavailable — surface the fallback honestly.
      const browser = new BrowserInferenceEngine();
      await browser.init();
      return { engine: browser, fellBack: true };
    }
  }
  const browser = new BrowserInferenceEngine();
  await browser.init();
  return { engine: browser, fellBack: false };
}

export { BrowserInferenceEngine, LocalServiceEngine };
