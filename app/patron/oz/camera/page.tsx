"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [filters, setFilters] = useState<string[]>([
    "/filters/oz_filter1.png",
    "/filters/oz_filter2.png",
    "/filters/oz_filter3.png",
    "/filters/oz_filter4.png",
    "/filters/oz_filter5.png",
  ]);
  const [activeFilter, setActiveFilter] = useState(0);
  const [captured, setCaptured] = useState<string | null>(null);

  // Open camera on mount
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    startCamera();
  }, []);

  // Swipe gesture (left/right)
  function handleSwipe(e: React.TouchEvent) {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const diff = e.nativeEvent.changedTouches[0].clientX - e.nativeEvent.targetTouches[0]?.clientX!;
    if (Math.abs(diff) < 50) return;

    if (diff > 0) {
      setActiveFilter((prev) => (prev + 1) % filters.length);
    } else {
      setActiveFilter((prev) => (prev - 1 + filters.length) % filters.length);
    }
  }

  // Capture image
  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw camera frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw overlay
    const overlay: HTMLImageElement = new window.Image();
    overlay.src = filters[activeFilter];
    overlay.onload = () => {
      ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
      setCaptured(canvas.toDataURL("image/png"));
    };
  }

  // Share or download
  async function handleShare() {
    if (!captured) return;

    const blob = await (await fetch(captured)).blob();
    const file = new File([blob], "snowwhite-photo.png", { type: "image/png" });

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Snow White at LFP",
          text: "Look at my Snow White experience!",
          files: [file],
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      const link = document.createElement("a");
      link.href = captured;
      link.download = "snowwhite-photo.png";
      link.click();
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {!captured ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onTouchEnd={handleSwipe}
            className="w-full max-w-md rounded-lg shadow-lg"
          />
          {/* Overlay filter */}
          <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center pointer-events-none">
            <Image
              src={filters[activeFilter]}
              alt="Filter"
              width={400}
              height={400}
              className="w-full max-w-md"
            />
          </div>
          <button
            onClick={handleCapture}
            className="mt-6 px-6 py-3 bg-red-600 rounded-full text-lg font-semibold shadow-lg"
          >
            Capture 📸
          </button>
        </>
      ) : (
        <>
          <Image
            src={captured}
            alt="Captured"
            width={400}
            height={600}
            className="rounded-lg shadow-lg"
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleShare}
              className="px-6 py-2 bg-green-600 rounded-lg shadow-lg"
            >
              Share
            </button>
            <button
              onClick={() => setCaptured(null)}
              className="px-6 py-2 bg-gray-600 rounded-lg shadow-lg"
            >
              Retake
            </button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
