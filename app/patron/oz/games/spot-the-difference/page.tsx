// app/patron/oz/games/spot-the-difference/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Difference = {
  x: number;
  y: number;
  radius: number;
};

const BASE_DIMENSIONS = {
  width: 960,
  height: 720,
};

const DIFFERENCES: Difference[] = [
  { x: 190, y: 210, radius: 55 },
  { x: 470, y: 250, radius: 50 },
  { x: 745, y: 230, radius: 55 },
  { x: 615, y: 420, radius: 60 },
  { x: 310, y: 515, radius: 55 },
  { x: 730, y: 600, radius: 65 },
];

const TOTAL_DIFFERENCES = DIFFERENCES.length;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function OzSpotTheDifferencePage() {
  const [foundSet, setFoundSet] = useState<Set<number>>(() => new Set());
  const [seconds, setSeconds] = useState(0);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: BASE_DIMENSIONS.width,
    height: BASE_DIMENSIONS.height,
  });
  const [renderSize, setRenderSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [liveMessage, setLiveMessage] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const foundCount = foundSet.size;
  const allFound = foundCount === TOTAL_DIFFERENCES;

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetGame = useCallback(() => {
    stopTimer();
    setFoundSet(new Set());
    setSeconds(0);
    setLiveMessage("");
    startTimer();
  }, [startTimer, stopTimer]);

  const updateRenderSize = useCallback(() => {
    if (imageRef.current) {
      setRenderSize({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
    };
  }, [startTimer, stopTimer]);

  useEffect(() => {
    if (allFound) {
      stopTimer();
      setLiveMessage("You found all 6!");
    }
  }, [allFound, stopTimer]);

  useEffect(() => {
    window.addEventListener("resize", updateRenderSize);
    return () => {
      window.removeEventListener("resize", updateRenderSize);
    };
  }, [updateRenderSize]);

  const scaledDifferences = useMemo(() => {
    const widthScale = naturalSize.width
      ? renderSize.width / naturalSize.width
      : 1;
    const heightScale = naturalSize.height
      ? renderSize.height / naturalSize.height
      : 1;

    return DIFFERENCES.map((difference) => {
      const scaledX =
        (difference.x / BASE_DIMENSIONS.width) * naturalSize.width * widthScale;
      const scaledY =
        (difference.y / BASE_DIMENSIONS.height) * naturalSize.height * heightScale;
      const scaledRadius =
        ((difference.radius / BASE_DIMENSIONS.width) * naturalSize.width * widthScale +
          (difference.radius / BASE_DIMENSIONS.height) * naturalSize.height * heightScale) /
        2;

      return {
        radius: scaledRadius,
        left: scaledX,
        top: scaledY,
      };
    });
  }, [naturalSize, renderSize]);

  const handleFound = useCallback((index: number) => {
    setFoundSet((prev) => {
      if (prev.has(index)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    imageRef.current = img;
    setNaturalSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setRenderSize({
      width: img.clientWidth,
      height: img.clientHeight,
    });
    requestAnimationFrame(() => {
      setRenderSize({
        width: img.clientWidth,
        height: img.clientHeight,
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#260000] via-[#3a0000] to-black text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/patron/oz/games"
            className="w-fit rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            ← Back
          </Link>
          <div className="text-center sm:text-left">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Wizard of Oz Games
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Spot the Difference
            </h1>
          </div>
          <div className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm">
            Timer: {formatTime(seconds)}
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="w-[90%] max-w-[420px] sm:w-[85%] md:w-[80%] lg:w-[70%] xl:w-[60%] mx-auto">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-lg">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src="/shows/oz/spot-the-difference/oz_original.png"
                  alt="Original Oz Scene"
                  width={960}
                  height={720}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
            <p className="mt-3 text-center text-sm text-white/70">
              Original
            </p>
          </div>

          <div className="mt-4 w-[90%] max-w-[420px] sm:w-[85%] md:w-[80%] lg:w-[70%] xl:w-[60%] mx-auto">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-lg">
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="/shows/oz/spot-the-difference/oz_differences.png"
                  alt="Spot the differences Oz scene"
                  width={960}
                  height={720}
                  className="h-auto w-full"
                  priority
                  onLoadingComplete={handleImageLoad}
                />

                {scaledDifferences.map((difference, index) => {
                  const isFound = foundSet.has(index);
                  const size = difference.radius * 2;

                  return (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Difference spot ${index + 1}`}
                      aria-pressed={isFound}
                      onClick={() => handleFound(index)}
                      disabled={isFound || allFound}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                        isFound
                          ? "border-[#ff0000] bg-[#ff000040] shadow-[0_0_12px_#ff0000]"
                          : "border-transparent bg-transparent hover:bg-[#ff000020]"
                      }`}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${difference.left}px`,
                        top: `${difference.top}px`,
                      }}
                    >
                      <span className="sr-only">
                        {isFound ? "Found" : "Not found"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="mt-3 text-center text-sm text-white/70">
              Find the differences
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-white/80">
          Differences found:{" "}
          <span className="font-semibold text-white">
            {foundCount} / {TOTAL_DIFFERENCES}
          </span>
        </div>

        {allFound ? (
          <div
            className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-lg"
            aria-live="polite"
          >
            <h2 className="text-2xl font-semibold">You found all 6!</h2>
            <p className="mt-2 text-sm text-white/70">
              Time:{" "}
              <span className="font-semibold text-white">
                {formatTime(seconds)}
              </span>
            </p>
            <button
              type="button"
              onClick={resetGame}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-[#b60000] px-4 py-3 text-base font-semibold transition hover:bg-[#cc0000] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Restart
            </button>
          </div>
        ) : (
          <div aria-live="polite" className="sr-only">
            {liveMessage}
          </div>
        )}
      </div>
    </div>
  );
}
