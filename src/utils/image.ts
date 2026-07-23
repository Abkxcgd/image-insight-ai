// Image utilities: validation, loading, compression, and result formatting.
export const MAX_IMAGE_MB = 10;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Unsupported file type. Please use JPG, PNG, WEBP, or GIF.";
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `Image too large. Max ${MAX_IMAGE_MB}MB.`;
  }
  return null;
}

// Compress a large image before running inference. Falls back to the
// original file on any failure — we never want to block classification.
export async function compressImage(file: File): Promise<File> {
  try {
    if (file.size < 800 * 1024) return file; // <800KB: skip
    const { default: imageCompression } = await import("browser-image-compression");
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    });
    return compressed;
  } catch (err) {
    console.warn("compression failed, using original", err);
    return file;
  }
}

// Turn a File into a preview URL and a decoded HTMLImageElement.
export function fileToImage(file: File): Promise<{ url: string; img: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ url, img });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read the image."));
    };
    img.src = url;
  });
}

// Downscale an HTMLImageElement into a small dataURL thumbnail (JPEG).
export function toThumbnail(img: HTMLImageElement, maxSide = 256, quality = 0.72): string {
  const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * ratio));
  const h = Math.max(1, Math.round(img.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export function formatConfidence(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

// MobileNet returns comma-separated synonyms; keep the primary label.
export function primaryLabel(className: string): string {
  return className.split(",")[0].trim();
}
