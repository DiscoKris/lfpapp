// app/patron/sw/games/memory-match/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Card = {
  id: string;       // unique per card instance
  key: string;      // pair key (used to check matches)
  face: string;     // emoji or image url
  matched: boolean;
};

function shuffle<T>(arr: T[]) {
  // Fisher–Yates
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryMatchPage() {
  // --- 1) Define your pairs (start with emojis; images optional below) ---
  // 8 pairs = 16 cards, perfect for a 4x4 grid
  const pairs = useMemo(
    () =>
      [
        { key: "1", face: "🧙‍♀️" },
        { key: "2", face: "🍎" },
        { key: "3", face: "🪄" },
        { key: "4", face: "🌟" },
        { key: "5", face: "👑" },
        { key: "6", face: "🕯️" },
        { key: "7", face: "🪞" },
        { key: "8", face: "🏰" },
      ] as { key: string; face: string }[],
    []
  );

  // If/when you switch to images, put files in /public/shows/sw/memory/ and replace `face`
  // with an image URL (e.g. "/shows/sw/memory/apple.png"). Keep two items with the same key.

  // --- 2) Build the deck & state ---
  const buildDeck = () =>
    shuffle(
      pairs
        .flatMap((p) => [
          { id: `${p.key}-a-${crypto.randomUUID()}`, key: p.key, face: p.face, matched: false },
          { id: `${p.key}-b-${crypto.randomUUID()}`, key: p.key, face: p.face, matched: false },
        ])
    );

  const [deck, setDeck] = useState<Card[]>(buildDeck);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 3) Timer ---
  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- 4) Game logic ---
  function onCardClick(card: Card) {
    if (locked) return;
    if (card.matched) return;
    if (flippedIds.includes(card.id)) return;
    if (flippedIds.length === 2) return;

    const next = [...flippedIds, card.id];
    setFlippedIds(next);

    if (next.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);

      const [aId, bId] = next;
      const a = deck.find((c) => c.id === aId)!;
      const b = deck.find((c) => c.id === bId)!;

      if (a.key === b.key) {
        // match
        setTimeout(() => {
          setDeck((d) => d.map((c) => (c.id === aId || c.id === bId ? { ...c, matched: true } : c)));
          setFlippedIds([]);
          setLocked(false);
        }, 300);
      } else {
        // no match
        setTimeout(() => {
          setFlippedIds([]);
          setLocked(false);
        }, 800);
      }
    }
  }

  const allMatched = deck.every((c) => c.matched);

  // --- 5) Restart ---
  function restart() {
    setDeck(buildDeck());
    setFlippedIds([]);
    setMoves(0);
    setSeconds(0);
  }

  // --- 6) Helpers ---
  function isFaceUp(card: Card) {
    return card.matched || flippedIds.includes(card.id);
  }

  // --- 7) UI ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#260000] via-[#3a0000] to-black text-white">
      <div className="mx-auto max-w-md px-4 pb-16 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/patron/sw/games"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Memory Match</h1>
          <button
            onClick={restart}
            className="rounded-xl border border-white/10 bg-[#b60000] px-3 py-2 text-sm hover:bg-[#cc0000]"
          >
            Restart
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between text-sm text-white/80">
          <div>Moves: <span className="font-semibold text-white">{moves}</span></div>
          <div>Time: <span className="font-semibold text-white">{seconds}s</span></div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {deck.map((card) => {
            const faceUp = isFaceUp(card);
            return (
              <button
                key={card.id}
                onClick={() => onCardClick(card)}
                disabled={faceUp || locked}
                className={`aspect-square rounded-2xl border border-white/10 p-0 text-2xl shadow-lg transition
                  ${faceUp ? "bg-[#cc0000]" : "bg-[#b60000] hover:bg-[#c30000] active:scale-[0.99]"}`
                }
                aria-label={faceUp ? `Face ${card.key}` : "Facedown card"}
              >
                <div className="flex h-full w-full items-center justify-center">
                  {/* If you switch to images, replace this with <img src={card.face} .../> */}
                  <span className="select-none">{card.face}</span>
                </div>
              </button>
            );
          })}
        </div>

        {allMatched && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-lg font-medium">You win! 🎉</p>
            <p className="mt-1 text-sm text-white/80">
              Time: <span className="font-semibold text-white">{seconds}s</span> ·
              Moves: <span className="font-semibold text-white">{moves}</span>
            </p>
            <button
              onClick={restart}
              className="mt-3 rounded-xl border border-white/10 bg-[#b60000] px-4 py-2 text-sm hover:bg-[#cc0000]"
            >
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
