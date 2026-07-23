import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

// Webcam capture modal. Streams `navigator.mediaDevices.getUserMedia` and
// exports a still frame as a JPEG File when the user snaps a picture.
export function CameraCapture({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) return;
    setError(null);
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error(err);
        setError("Couldn't access the camera. Check browser permissions.");
      }
    })();
    return stop;
  }, [open, facing, stop]);

  const snap = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass relative w-full max-w-2xl overflow-hidden rounded-3xl p-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold">Camera capture</h3>
              <button
                onClick={onClose}
                aria-label="Close camera"
                className="grid h-9 w-9 place-items-center rounded-full bg-muted hover:scale-105 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
              {error ? (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-destructive-foreground bg-destructive/80">
                  {error}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() =>
                  setFacing((f) => (f === "user" ? "environment" : "user"))
                }
                className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium hover:scale-105 transition"
              >
                <RotateCcw className="h-4 w-4" /> Flip
              </button>
              <button
                onClick={snap}
                disabled={!!error}
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground glow transition hover:scale-105 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" /> Capture
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
