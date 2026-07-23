// Utility: validate a File is an acceptable image and return a preview URL + HTMLImageElement.
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

// Load a file into an <img> element ready for TensorFlow to process.
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

export function formatConfidence(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

// MobileNet returns comma-separated synonyms; return the primary label.
export function primaryLabel(className: string): string {
  return className.split(",")[0].trim();
}
