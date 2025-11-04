"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebaseConfig";

const FALLBACK_WORDS = [
  "ozian",
  "toto",
  "lions",
  "witch",
  "glinda",
  "yellow",
  "poppy",
  "tinman",
  "emerald",
  "rainbow",
  "twister",
  "dorothy",
  "broom",
];

const MAX_GUESSES = 6;
type TileStatus = "correct" | "present" | "absent";

function InlineBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = useCallback(() => {
    if (pathname.startsWith("/patron/oz/games") && pathname !== "/patron/oz/games") {
      router.push("/patron/oz/games");
      return;
    }
    if (pathname.startsWith("/patron/oz") && pathname !== "/patron/oz") {
      router.push("/patron/oz");
      return;
    }
    router.back();
  }, [pathname, router]);

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 rounded-2xl border border-lfp-border px-4 py-2 text-sm font-medium text-lfp-text transition-colors hover:border-lfp-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lfp-accent focus-visible:ring-offset-1"
    >
      <span aria-hidden>←</span>
      Back
    </button>
  );
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function evaluateGuess(guess: string, solution: string): TileStatus[] {
  const result: TileStatus[] = Array.from({ length: guess.length }, () => "absent");
  const solutionChars = solution.split("");
  const used = Array(solution.length).fill(false);

  // Correct positions
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === solutionChars[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  // Present letters
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    const letter = guess[i];
    const index = solutionChars.findIndex((ch, idx) => ch === letter && !used[idx]);
    if (index !== -1) {
      result[i] = "present";
      used[index] = true;
    }
  }

  return result;
}

function getBestStatus(existing: TileStatus | undefined, incoming: TileStatus): TileStatus {
  if (existing === "correct" || incoming === "correct") return "correct";
  if (existing === "present" || incoming === "present") return "present";
  return "absent";
}

type StoredState = {
  solution: string;
  guesses: string[];
  statuses: TileStatus[][];
  won: boolean;
  lost: boolean;
};

export default function WordOfOzPage() {
  const [wordList, setWordList] = useState<string[]>(FALLBACK_WORDS);
  const [loadingWords, setLoadingWords] = useState(true);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<TileStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const storageKey = `lfp-wordle-OZ-${todayKey}`;

  const solution = useMemo(() => {
    const cleaned = wordList.map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (cleaned.length === 0) {
      return FALLBACK_WORDS[0];
    }
    const seed = `OZ-${todayKey}`;
    const index = hashSeed(seed) % cleaned.length;
    return cleaned[index];
  }, [todayKey, wordList]);

  const solutionLength = solution.length;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "shows", "OZ"));
        if (snap.exists()) {
          const data = snap.data();
          const remoteList = Array.isArray(data?.wordleWords) ? data.wordleWords : [];
          if (remoteList.length > 0 && mounted) {
            setWordList(remoteList as string[]);
          }
        }
      } catch (error) {
        console.warn("Unable to load Wordle words from Firestore:", error);
      } finally {
        if (mounted) setLoadingWords(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      setGuesses([]);
      setStatuses([]);
      setCurrentGuess("");
      setWon(false);
      setLost(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredState;
      if (parsed.solution !== solution) {
        window.localStorage.removeItem(storageKey);
        setGuesses([]);
        setStatuses([]);
        setCurrentGuess("");
        setWon(false);
        setLost(false);
        return;
      }
      setGuesses(parsed.guesses ?? []);
      setStatuses(parsed.statuses ?? []);
      setWon(Boolean(parsed.won));
      setLost(Boolean(parsed.lost));
      setCurrentGuess("");
    } catch (error) {
      console.error("Failed to parse stored Wordle state:", error);
      window.localStorage.removeItem(storageKey);
      setGuesses([]);
      setStatuses([]);
      setCurrentGuess("");
      setWon(false);
      setLost(false);
    }
  }, [solution, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: StoredState = {
      solution,
      guesses,
      statuses,
      won,
      lost,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [guesses, statuses, won, lost, solution, storageKey]);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 2000);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const isComplete = won || lost;

  const submitGuess = useCallback(() => {
    const trimmed = currentGuess.trim().toLowerCase();
    if (trimmed.length !== solutionLength) {
      setFeedback(`Needs ${solutionLength} letters.`);
      return;
    }
    if (!/^[a-z]+$/.test(trimmed)) {
      setFeedback("Letters only.");
      return;
    }
    const evaluation = evaluateGuess(trimmed, solution);
    const nextGuesses = [...guesses, trimmed];
    const nextStatuses = [...statuses, evaluation];
    setGuesses(nextGuesses);
    setStatuses(nextStatuses);
    setCurrentGuess("");
    if (trimmed === solution) {
      setWon(true);
      setLost(false);
      return;
    }
    if (nextGuesses.length >= MAX_GUESSES) {
      setLost(true);
    }
  }, [currentGuess, solution, solutionLength, guesses, statuses]);

  const handleKeyInput = useCallback(
    (value: string) => {
      if (isComplete) return;
      if (value === "ENTER") {
        submitGuess();
        return;
      }
      if (value === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }
      if (/^[a-zA-Z]$/.test(value)) {
        setCurrentGuess((prev) => {
          if (prev.length >= solutionLength) return prev;
          return prev + value.toLowerCase();
        });
      }
    },
    [isComplete, submitGuess, solutionLength]
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "Enter") {
        event.preventDefault();
        handleKeyInput("ENTER");
        return;
      }
      if (key === "Backspace") {
        event.preventDefault();
        handleKeyInput("BACKSPACE");
        return;
      }
      if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        handleKeyInput(key.toUpperCase());
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleKeyInput]);

  const letterState = useMemo(() => {
    const map = new Map<string, TileStatus>();
    statuses.forEach((row, rowIndex) => {
      row.forEach((status, colIndex) => {
        const letter = guesses[rowIndex]?.[colIndex];
        if (!letter) return;
        const existing = map.get(letter);
        map.set(letter, getBestStatus(existing, status));
      });
    });
    return map;
  }, [guesses, statuses]);

  const rows = useMemo(() => {
    return Array.from({ length: MAX_GUESSES }, (_, index) => {
      if (index < guesses.length) {
        return guesses[index];
      }
      if (index === guesses.length && !isComplete) {
        return currentGuess.padEnd(solutionLength, " ");
      }
      return "".padEnd(solutionLength, " ");
    });
  }, [guesses, currentGuess, solutionLength, isComplete]);

  const rowStatuses = useMemo(() => {
    return Array.from({ length: MAX_GUESSES }, (_, index) => {
      if (index < statuses.length) return statuses[index];
      return Array(solutionLength).fill(null);
    });
  }, [statuses, solutionLength]);

  const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

  const bannerMessage = useMemo(() => {
    if (!isComplete) return null;
    if (won) {
      return `Solved! The word was “${solution.toUpperCase()}”.`;
    }
    return `Tough one — today’s word was “${solution.toUpperCase()}”.`;
  }, [isComplete, won, solution]);

  return (
    <main className="flex min-h-screen flex-col bg-lfp-muted text-lfp-text">
      <header className="sticky top-0 z-10 border-b border-lfp-border bg-lfp-surface px-4 py-3">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
          <InlineBackButton />
          <h1 className="text-lg font-semibold text-lfp-text md:text-xl">Word of Oz</h1>
          <span className="w-[96px] md:w-[120px]" aria-hidden />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-16 pt-6">
        <div className="flex flex-col items-center gap-6">
          {loadingWords && (
            <p className="text-sm text-lfp-text-weak">Fetching today’s word list…</p>
          )}

          <div
            className="w-full rounded-3xl border border-lfp-border bg-lfp-surface p-6 shadow-sm"
            role="application"
            aria-label="Word of Oz board"
          >
            <div
              className="grid gap-2"
              style={{ gridTemplateRows: `repeat(${MAX_GUESSES}, minmax(0, 1fr))` }}
            >
              {rows.map((row, rowIdx) => {
                const letters = row.split("");
                const currentStatuses = rowStatuses[rowIdx];
                return (
                  <div
                    key={`row-${rowIdx}`}
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${solutionLength}, minmax(0, 1fr))`,
                    }}
                  >
                    {letters.map((letter, colIdx) => {
                      const status = currentStatuses[colIdx];
                      const isActiveRow = rowIdx === guesses.length && !isComplete;
                      const displayLetter = letter.trim() ? letter.toUpperCase() : "";
                      let classes =
                        "flex h-14 items-center justify-center rounded-2xl border border-lfp-border bg-lfp-surface text-lg font-semibold text-lfp-text transition-colors md:h-16 md:text-xl";
                      if (status === "correct") {
                        classes =
                          "flex h-14 items-center justify-center rounded-2xl border border-lfp-success bg-lfp-success text-lg font-semibold text-white transition-colors md:h-16 md:text-xl";
                      } else if (status === "present") {
                        classes =
                          "flex h-14 items-center justify-center rounded-2xl border border-lfp-warning bg-lfp-warning text-lg font-semibold text-white transition-colors md:h-16 md:text-xl";
                      } else if (status === "absent") {
                        classes =
                          "flex h-14 items-center justify-center rounded-2xl border border-lfp-muted bg-lfp-muted text-lg font-semibold text-lfp-text transition-colors md:h-16 md:text-xl";
                      } else if (isActiveRow && displayLetter) {
                        classes += " border-lfp-primary text-lfp-text";
                      }
                      return (
                        <div key={`cell-${rowIdx}-${colIdx}`} className={classes}>
                          {displayLetter}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {feedback && (
            <div
              className="rounded-full border border-lfp-warning bg-lfp-surface px-4 py-2 text-sm text-lfp-text"
              role="status"
            >
              {feedback}
            </div>
          )}

          {isComplete && bannerMessage && (
            <div
              className="w-full rounded-3xl border border-lfp-border bg-lfp-surface p-4 text-center text-sm text-lfp-text"
              role="status"
            >
              <p className="font-semibold">{bannerMessage}</p>
              <p className="mt-1 text-xs text-lfp-text-weak">New word at midnight.</p>
            </div>
          )}

          <div className="w-full rounded-3xl border border-lfp-border bg-lfp-surface p-4 shadow-sm">
            <div className="grid gap-2">
              {keyboardRows.map((row) => (
                <div key={row} className="flex justify-center gap-2">
                  {row.split("").map((letter) => {
                    const status = letterState.get(letter.toLowerCase());
                    let keyClasses =
                      "flex-1 select-none rounded-2xl border border-lfp-border bg-lfp-surface px-3 py-3 text-center text-sm font-semibold text-lfp-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lfp-accent focus-visible:ring-offset-1";
                    if (status === "correct") {
                      keyClasses =
                        "flex-1 select-none rounded-2xl border border-lfp-success bg-lfp-success px-3 py-3 text-center text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lfp-accent focus-visible:ring-offset-1";
                    } else if (status === "present") {
                      keyClasses =
                        "flex-1 select-none rounded-2xl border border-lfp-warning bg-lfp-warning px-3 py-3 text-center text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lfp-accent focus-visible:ring-offset-1";
                    } else if (status === "absent") {
                      keyClasses =
                        "flex-1 select-none rounded-2xl border border-lfp-muted bg-lfp-muted px-3 py-3 text-center text-sm font-semibold text-lfp-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lfp-accent focus-visible:ring-offset-1";
                    }
                    return (
                      <button
                        key={letter}
                        type="button"
                        className={keyClasses}
                        onClick={() => handleKeyInput(letter)}
                        aria-label={`Letter ${letter}`}
                        disabled={isComplete}
                      >
                        {letter}
                      </button>
                    );
                  })}
                  {row === "ZXCVBNM" && (
                    <>
                      <button
                        type="button"
                        className="flex-[1.5] select-none rounded-2xl border border-lfp-border bg-lfp-primary px-3 py-3 text-center text-sm font-semibold text-lfp-surface transition-colors hover:border-lfp-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lfp-accent focus-visible:ring-offset-1 disabled:opacity-60"
                        onClick={() => handleKeyInput("ENTER")}
                        disabled={isComplete}
                      >
                        Enter
                      </button>
                      <button
                        type="button"
                        className="flex-[1.5] select-none rounded-2xl border border-lfp-border bg-lfp-surface px-3 py-3 text-center text-sm font-semibold text-lfp-text transition-colors hover:border-lfp-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lfp-accent focus-visible:ring-offset-1 disabled:opacity-60"
                        onClick={() => handleKeyInput("BACKSPACE")}
                        disabled={isComplete}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
