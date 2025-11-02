"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "../../../../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const SHOW_ID = "OZ25";                 // ← change to OZ25 on the Oz page
const DASHBOARD_PATH = "/patron/oz/dashboard"; // ← change to /patron/oz/dashboard on the Oz page

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start with your local defaults; we’ll prepend Firestore filter if present
  const [filters, setFilters] = useState<string[]>([
    "/filters/oz_filter1.png",
    "/filters/oz_filter2.png",
    "/filters/oz_filter3.png",
    "/filters/oz_filter4.png",
    "/filters/oz_filter5.png",
  ]);
  const [activeFilter, setActiveFilter] = useState(0);
  const [captured, setCaptured] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string>("");

  // Load uploaded filter from Firestore (filterUrl or cameraFilterUrl)
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "shows", SHOW_ID));
        if (!snap.exists()) return;
        const d = snap.data() as any;
        const uploaded = (d?.filterUrl ?? d?.cameraFilterUrl ?? "") as string;
        if (uploaded) {
          setFilters((prev) => [uploaded, ...prev]); // put uploaded filter first
          setActiveFilter(0);
        }
      } catch (e) {
        console.error(e);
        setErr("Could not load camera filter.");
      }
    })();
  }, []);

  // iOS needs a user gesture — so we show a Start button, but we also try to start for browsers that allow autoplay
  useEffect(() => {
    startCamera(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera(silent = false) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      }
    } catch (e) {
      console.error(e);
      if (!silent) setErr("Camera permission denied or unavailable.");
    }
  }

  // Swipe gestures
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = endX - touchStartX.current;
    const THRESH = 40;
    if (Math.abs(diff) >= THRESH) {
      if (diff < 0) nextFilter(); else prevFilter();
    }
    touchStartX.current = null;
  }
  const nextFilter = () => setActiveFilter((i) => (i + 1) % filters.length);
  const prevFilter = () => setActiveFilter((i) => (i - 1 + filters.length) % filters.length);

  // Capture with overlay
  async function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 1080;
    const h = video.videoHeight || 1920;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw camera frame
    ctx.drawImage(video, 0, 0, w, h);

    // Draw overlay
    const overlay = new Image();
    overlay.crossOrigin = "anonymous";
    overlay.src = filters[activeFilter];
    try { await overlay.decode(); } catch {}
    ctx.drawImage(overlay, 0, 0, w, h);

    setCaptured(canvas.toDataURL("image/png"));
  }

  // Share / Download
  async function handleShare() {
    if (!captured) return;
    const blob = await (await fetch(captured)).blob();
    const file = new File([blob], "lfp-selfie.png", { type: "image/png" });

    if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
      try {
        await (navigator as any).share({
          files: [file],
          title: "Lythgoe Selfie",
          text: "Snapped at the show!",
        });
        return;
      } catch {
        // fall through to download
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lfp-selfie.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | undefined;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-sm mx-auto">
        {/* Back button */}
        <a
          href={DASHBOARD_PATH}
          className="inline-block mb-4 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm"
        >
          ← Back
        </a>

        <h1 className="text-xl font-semibold mb-3">Camera</h1>

        {/* Live camera with overlay */}
        <div
          className="relative w-full rounded-xl overflow-hidden bg-black"
          style={{ aspectRatio: "9/16" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          {/* Overlay PNG */}
          <img
            src={filters[activeFilter]}
            alt="Filter overlay"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Left/Right nubs */}
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

        {/* Controls */}
        {!ready ? (
          <button
            onClick={() => startCamera(false)}
            className="mt-4 w-full py-3 bg-red-700 hover:bg-red-600 rounded-xl font-semibold"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={handleCapture}
            className="mt-4 w-full py-3 bg-red-700 hover:bg-red-600 rounded-xl font-semibold"
          >
            Capture 📸
          </button>
        )}

        {err && <p className="mt-2 text-yellow-300 text-sm">{err}</p>}

        {/* Review screen */}
        {captured && (
          <div className="mt-5 text-center">
            <img src={captured} alt="Captured" className="w-full rounded-xl shadow-lg" />
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleShare}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold"
              >
                Share
              </button>
              <button
                onClick={() => setCaptured(null)}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-semibold"
              >
                Retake
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for compositing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  );
}
