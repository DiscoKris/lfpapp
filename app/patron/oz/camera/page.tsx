"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DASHBOARD_PATH = "/patron/oz";
const FILTERS = [
  "/filters/oz_filter1.png",
  "/filters/oz_filter2.png",
  "/filters/oz_filter3.png",
  "/filters/oz_filter4.png",
  "/filters/oz_filter5.png",
];
const DOWNLOAD_FILENAME = "wonderful-winter-of-oz-selfie.png";

type FacingMode = "user" | "environment";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const [activeFilter, setActiveFilter] = useState(0);
  const [captured, setCaptured] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const [facingMode, setFacingMode] = useState<FacingMode>("user");

  const stopStream = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(
    async (silent = false) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErr("Camera not supported on this device.");
        return;
      }

      try {
        setErr("");
        setReady(false);
        stopStream();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1080 },
            height: { ideal: 1920 },
          },
          audio: false,
        });

        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        video.srcObject = stream;
        await video.play();
        setReady(true);
      } catch (error) {
        console.error(error);
        stopStream();
        if (!silent) {
          setErr("Camera permission denied or unavailable. Please allow access and try again.");
        }
      }
    },
    [facingMode, stopStream]
  );

  useEffect(() => {
    startCamera(true);
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  const nextFilter = useCallback(() => {
    setActiveFilter((idx) => (idx + 1) % FILTERS.length);
  }, []);

  const prevFilter = useCallback(() => {
    setActiveFilter((idx) => (idx - 1 + FILTERS.length) % FILTERS.length);
  }, []);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = endX - touchStartX.current;
    const THRESH = 40;
    if (Math.abs(diff) >= THRESH) {
      if (diff < 0) nextFilter();
      else prevFilter();
    }
    touchStartX.current = null;
  }

  async function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1080;
    const height = video.videoHeight || 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    const overlay = new Image();
    overlay.crossOrigin = "anonymous";
    const overlaySrc = FILTERS[activeFilter] ?? FILTERS[0];
    overlay.src = overlaySrc;
    await new Promise<void>((resolve) => {
      if (overlay.complete) return resolve();
      overlay.onload = () => resolve();
      overlay.onerror = () => resolve();
    });

    try {
      ctx.drawImage(overlay, 0, 0, width, height);
    } catch {
      // continue without overlay if drawing fails
    }

    try {
      const dataUrl = canvas.toDataURL("image/png");
      setCaptured(dataUrl);
    } catch (error) {
      console.error("Export failed:", error);
      setCaptured(canvas.toDataURL("image/png"));
    }
  }

  const getCapturedBlob = useCallback(async () => {
    if (!captured) return null;
    const response = await fetch(captured);
    return await response.blob();
  }, [captured]);

  function triggerDownload(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = DOWNLOAD_FILENAME;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    const blob = await getCapturedBlob();
    if (!blob) return;

    const file = new File([blob], DOWNLOAD_FILENAME, { type: "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };

    if (nav.canShare?.({ files: [file] })) {
      try {
        await nav.share?.({
          files: [file],
          title: "Wonderful Winter of Oz Selfie",
          text: "Snapped at The Wonderful Winter of Oz!",
        });
        return;
      } catch (error) {
        console.warn("Share cancelled or failed, falling back to download.", error);
      }
    }

    triggerDownload(blob);
  }

  async function handleDownload() {
    const blob = await getCapturedBlob();
    if (!blob) return;
    triggerDownload(blob);
  }

  function handleRetake() {
    setCaptured(null);
  }

  function toggleCamera() {
    setCaptured(null);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }

  const filterSrc = FILTERS[activeFilter] ?? FILTERS[0];

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-sm mx-auto">
        <a
          href={DASHBOARD_PATH}
          className="inline-block mb-4 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm"
        >
          ← Back
        </a>

        <h1 className="text-xl font-semibold mb-3">Camera</h1>

        <div
          className="relative w-full rounded-xl overflow-hidden bg-black"
          style={{ aspectRatio: "9/16" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          <img
            src={filterSrc}
            alt="Filter overlay"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          <button
            onClick={prevFilter}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-1"
            aria-label="Previous filter"
          >
            ‹
          </button>
          <button
            onClick={nextFilter}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-1"
            aria-label="Next filter"
          >
            ›
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {ready ? (
            <button
              onClick={handleCapture}
              className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-xl font-semibold"
            >
              Capture 📸
            </button>
          ) : (
            <button
              onClick={() => startCamera(false)}
              className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-xl font-semibold"
            >
              Start Camera
            </button>
          )}

          <button
            onClick={toggleCamera}
            className="w-full py-3 bg-white/15 hover:bg-white/25 rounded-xl font-semibold"
          >
            Use {facingMode === "user" ? "Back" : "Front"} Camera
          </button>
        </div>

        {err && (
          <div className="mt-3 text-sm text-yellow-300 space-y-2">
            <p>{err}</p>
            <button
              onClick={() => startCamera(false)}
              className="inline-flex items-center justify-center rounded-lg bg-white/15 px-3 py-2 font-semibold text-white hover:bg-white/25"
            >
              Retry
            </button>
          </div>
        )}

        {captured && (
          <div className="mt-5 text-center">
            <img src={captured} alt="Captured" className="w-full rounded-xl shadow-lg" />
            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold"
              >
                Share
              </button>
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-xl font-semibold"
              >
                Download / Save
              </button>
              <button
                onClick={handleRetake}
                className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold"
              >
                Retake
              </button>
            </div>
            <p className="mt-3 text-xs opacity-80">
              Tip: If the download dialog does not appear, use Share → “Save Image” to add it to your camera roll.
            </p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  );
}
