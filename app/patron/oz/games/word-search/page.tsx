// app/patron/oz/games/word-search/page.tsx
"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const GRID_SIZE = 12;
const WORDS = [
  "EMERALD",
  "DOROTHY",
  "TOTO",
  "WIZARD",
  "SCARECROW",
  "TINMAN",
  "LION",
  "YELLOW",
] as const;

type Word = (typeof WORDS)[number];
type Position = { row: number; col: number };
type PlacedWord = {
  word: Word;
  start: Position;
  end: Position;
  cells: number[];
};

type Puzzle = {
  grid: string[][];
  placedWords: PlacedWord[];
};

const DIRECTIONS: Array<[number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function randomLetter() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function createPuzzle(): Puzzle {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill("")
  );
  const placedWords: PlacedWord[] = [];

  for (const word of WORDS) {
    let placed = false;
    const attempts = GRID_SIZE * GRID_SIZE * 6;

    for (let attempt = 0; attempt < attempts && !placed; attempt++) {
      const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);
      const endRow = startRow + dr * (word.length - 1);
      const endCol = startCol + dc * (word.length - 1);

      if (
        endRow < 0 ||
        endRow >= GRID_SIZE ||
        endCol < 0 ||
        endCol >= GRID_SIZE
      ) {
        continue;
      }

      const path: number[] = [];
      let conflict = false;
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dr * i;
        const c = startCol + dc * i;
        const current = grid[r][c];
        if (current && current !== word[i]) {
          conflict = true;
          break;
        }
        path.push(r * GRID_SIZE + c);
      }

      if (conflict) continue;

      for (let i = 0; i < word.length; i++) {
        const r = startRow + dr * i;
        const c = startCol + dc * i;
        grid[r][c] = word[i];
      }

      placedWords.push({
        word,
        start: { row: startRow, col: startCol },
        end: { row: endRow, col: endCol },
        cells: path,
      });
      placed = true;
    }

    if (!placed) {
      throw new Error(`Failed to place word ${word}`);
    }
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) {
        grid[r][c] = randomLetter();
      }
    }
  }

  return { grid, placedWords };
}

function arraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function arraysEqualReversed(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[b.length - 1 - i]) return false;
  }
  return true;
}

export default function OzWordSearchPage() {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => createPuzzle());
  const [foundWords, setFoundWords] = useState<Set<Word>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<number>>(new Set());
  const [activePathState, setActivePathState] = useState<number[]>([]);
  const [liveMessage, setLiveMessage] = useState("");

  const gridRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<Position | null>(null);
  const directionRef = useRef<{ dr: number; dc: number } | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const puzzleRef = useRef(puzzle);
  const activePathRef = useRef<number[]>(activePathState);

  useEffect(() => {
    puzzleRef.current = puzzle;
  }, [puzzle]);

  useEffect(() => {
    activePathRef.current = activePathState;
  }, [activePathState]);

  useEffect(
    () => () => {
      cleanupRef.current?.();
    },
    []
  );

  const setActivePath = useCallback((path: number[]) => {
    activePathRef.current = path;
    setActivePathState(path);
  }, []);

  const resetSelection = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    pointerIdRef.current = null;
    dragStartRef.current = null;
    directionRef.current = null;
    setActivePath([]);
  }, [setActivePath]);

  const resetGame = useCallback(() => {
    setPuzzle(createPuzzle());
    setFoundWords(new Set());
    setFoundCells(new Set());
    setLiveMessage("");
    resetSelection();
  }, [resetSelection]);

  const updatePath = useCallback(
    (targetRow: number, targetCol: number) => {
      const start = dragStartRef.current;
      if (!start) return;

      const startIndex = start.row * GRID_SIZE + start.col;
      if (targetRow === start.row && targetCol === start.col) {
        directionRef.current = null;
        setActivePath([startIndex]);
        return;
      }

      const dr = targetRow - start.row;
      const dc = targetCol - start.col;
      const stepRow = Math.sign(dr);
      const stepCol = Math.sign(dc);
      const absDr = Math.abs(dr);
      const absDc = Math.abs(dc);

      if (
        (stepRow !== 0 && stepCol !== 0 && absDr !== absDc) ||
        (stepRow === 0 && stepCol === 0)
      ) {
        return;
      }

      if (directionRef.current) {
        if (
          directionRef.current.dr !== stepRow ||
          directionRef.current.dc !== stepCol
        ) {
          return;
        }
      } else {
        directionRef.current = { dr: stepRow, dc: stepCol };
      }

      const steps = Math.max(absDr, absDc);
      const path: number[] = [];

      for (let i = 0; i <= steps; i++) {
        const r = start.row + stepRow * i;
        const c = start.col + stepCol * i;
        if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE) {
          return;
        }
        path.push(r * GRID_SIZE + c);
      }

      setActivePath(path);
    },
    [setActivePath]
  );

  const pointerMoveListener = useCallback(
    (event: PointerEvent) => {
      if (
        pointerIdRef.current === null ||
        event.pointerId !== pointerIdRef.current
      ) {
        return;
      }

      const element = document.elementFromPoint(
        event.clientX,
        event.clientY
      ) as HTMLElement | null;
      if (!element) return;

      const button = element.closest<HTMLButtonElement>("[data-row][data-col]");
      if (!button) return;
      if (!gridRef.current || !gridRef.current.contains(button)) return;

      const row = Number(button.dataset.row);
      const col = Number(button.dataset.col);
      updatePath(row, col);
    },
    [updatePath]
  );

  const finishSelection = useCallback(() => {
    const path = activePathRef.current;
    if (path.length < 2) {
      resetSelection();
      return;
    }

    const match = puzzleRef.current.placedWords.find((placed) => {
      if (placed.cells.length !== path.length) return false;
      return (
        arraysEqual(placed.cells, path) ||
        arraysEqualReversed(placed.cells, path)
      );
    });

    if (match) {
      setFoundWords((prev) => {
        if (prev.has(match.word)) return prev;
        const next = new Set(prev);
        next.add(match.word);
        return next;
      });
      setFoundCells((prev) => {
        const next = new Set(prev);
        match.cells.forEach((cell) => next.add(cell));
        return next;
      });
      setLiveMessage(`${match.word} found`);
    } else {
      setLiveMessage("");
    }

    resetSelection();
  }, [resetSelection]);

  const pointerUpListener = useCallback(
    (event: PointerEvent) => {
      if (
        pointerIdRef.current === null ||
        event.pointerId !== pointerIdRef.current
      ) {
        return;
      }
      finishSelection();
    },
    [finishSelection]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, row: number, col: number) => {
      const index = row * GRID_SIZE + col;
      if (foundCells.has(index)) return;

      event.preventDefault();
      cleanupRef.current?.();

      pointerIdRef.current = event.pointerId;
      dragStartRef.current = { row, col };
      directionRef.current = null;
      setActivePath([index]);
      setLiveMessage("");

      window.addEventListener("pointermove", pointerMoveListener);
      window.addEventListener("pointerup", pointerUpListener);
      window.addEventListener("pointercancel", pointerUpListener);

      cleanupRef.current = () => {
        window.removeEventListener("pointermove", pointerMoveListener);
        window.removeEventListener("pointerup", pointerUpListener);
        window.removeEventListener("pointercancel", pointerUpListener);
      };
    },
    [foundCells, pointerMoveListener, pointerUpListener, setActivePath]
  );

  const puzzleWords = useMemo(() => Array.from(WORDS), []);

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
              Snow White Games
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Word Search
            </h1>
          </div>
          <button
            onClick={resetGame}
            className="w-fit rounded-xl border border-white/10 bg-[#b60000] px-4 py-2 text-sm font-semibold hover:bg-[#cc0000] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Restart
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            <section aria-labelledby="word-list">
              <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                <span id="word-list">
                  Found {foundWords.size}/{puzzleWords.length}
                </span>
                <span aria-live="polite" className="text-xs text-white/60">
                  {liveMessage}
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-2 text-base font-medium">
                {puzzleWords.map((word) => {
                  const isFound = foundWords.has(word);
                  return (
                    <li
                      key={word}
                      className={`tracking-wide ${
                        isFound ? "line-through opacity-60" : "opacity-95"
                      }`}
                    >
                      {word}
                    </li>
                  );
                })}
              </ul>
            </section>

            <div
              ref={gridRef}
              className="mx-auto grid aspect-square w-full max-w-xl select-none grid-cols-12 gap-1 rounded-3xl border border-white/10 bg-white/10 p-3"
            >
              {puzzle.grid.map((rowLetters, row) =>
                rowLetters.map((letter, col) => {
                  const index = row * GRID_SIZE + col;
                  const isFound = foundCells.has(index);
                  const isActive = activePathState.includes(index);
                  const baseStyles =
                    "relative flex items-center justify-center rounded-lg border border-black/5 text-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b60000]";
                  const stateStyles = isFound
                    ? "bg-[#7a0000] text-white pointer-events-none"
                    : isActive
                    ? "bg-[#ffdddd]"
                    : "bg-white text-black hover:bg-[#ffecec]";
                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      data-row={row}
                      data-col={col}
                      data-state={
                        isFound ? "found" : isActive ? "active" : "idle"
                      }
                      onPointerDown={(event) =>
                        handlePointerDown(event, row, col)
                      }
                      aria-label={`Row ${row + 1}, Column ${
                        col + 1
                      }, letter ${letter}`}
                      aria-pressed={isFound || isActive || false}
                      className={`${baseStyles} ${stateStyles}`}
                    >
                      <span className="select-none">{letter}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
