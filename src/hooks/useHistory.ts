import { useCallback, useEffect, useState } from "react";
import type { Prediction } from "./useImageClassifier";

export interface HistoryEntry {
  id: string;
  createdAt: number;
  thumbnail: string; // dataURL (small)
  predictions: Prediction[];
  inferenceMs: number;
  modelName: string;
}

const KEY = "visionai:history";
const MAX_ENTRIES = 20;

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

// Hook: reads/writes prediction history from localStorage.
export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setEntries(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (next: HistoryEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch (err) {
      console.warn("history persist failed", err);
    }
  };

  const add = useCallback((entry: Omit<HistoryEntry, "id" | "createdAt">) => {
    const next: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const merged = [next, ...read()].slice(0, MAX_ENTRIES);
    persist(merged);
    return next;
  }, []);

  const remove = useCallback((id: string) => {
    persist(read().filter((e) => e.id !== id));
  }, []);

  const clear = useCallback(() => persist([]), []);

  return { entries, add, remove, clear };
}
