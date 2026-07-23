import { useCallback, useRef, useState } from "react";
import { AlertCircle, ImageIcon, Loader2, RefreshCw, UploadCloud, X } from "lucide-react";
import { useImageClassifier } from "@/hooks/useImageClassifier";
import { fileToImage, validateImage } from "@/utils/image";
import { PredictionList } from "./PredictionList";

// Central classifier surface: drag/drop or click to select, then run inference.
export function Classifier() {
  const {
    classify,
    predictions,
    isModelLoading,
    isClassifying,
    error,
    reset,
    setError,
  } = useImageClassifier();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Common handler for files coming from the input or drop event.
  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      const validationErr = validateImage(file);
      if (validationErr) {
        setError(validationErr);
        return;
      }
      try {
        reset();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const { url, img } = await fileToImage(file);
        setPreviewUrl(url);
        // Wait one frame so preview is painted before heavy inference.
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        await classify(img);
      } catch (e) {
        console.error(e);
        setError("Couldn't read that image. Try a different file.");
      }
    },
    [classify, previewUrl, reset, setError],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section id="classify" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="glass overflow-hidden rounded-3xl p-6 sm:p-10">
        {isModelLoading && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading MobileNet model… this happens once.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Drop zone / preview */}
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => !previewUrl && inputRef.current?.click()}
              className={`relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-border/70 hover:border-primary/60 hover:bg-muted/40"
              }`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                    aria-label="Remove image"
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground animate-float">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Drop an image here</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      or click to browse · JPG, PNG, WEBP up to 10MB
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            {previewUrl && (
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <RefreshCw className="h-4 w-4" /> Try another image
              </button>
            )}
          </div>

          {/* Results panel */}
          <div className="flex min-h-[240px] flex-col justify-center">
            {error ? (
              <div className="flex items-start gap-3 rounded-xl bg-destructive/10 p-4 text-destructive">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            ) : predictions || isClassifying ? (
              <PredictionList predictions={predictions} isClassifying={isClassifying} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-muted-foreground">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <p className="max-w-xs text-sm">
                  Predictions will appear here once you drop an image.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
