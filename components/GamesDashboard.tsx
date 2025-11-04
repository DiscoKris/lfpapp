"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { Brain, FileText, HelpCircle, Search } from "lucide-react";

type GamesDashboardProps = {
  basePath: string;
  showId?: string;
};

type TileConfig = {
  title: string;
  description: string;
  path: string;
  Icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  fallbackEmoji: string;
  emojiLabel: string;
};

function IconRenderer({
  Icon,
  fallbackEmoji,
  emojiLabel,
}: {
  Icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  fallbackEmoji: string;
  emojiLabel: string;
}) {
  if (!Icon) {
    return (
      <span
        aria-label={emojiLabel}
        role="img"
        className="text-2xl leading-none"
      >
        {fallbackEmoji}
      </span>
    );
  }

  return <Icon aria-hidden className="h-6 w-6" />;
}

export default function GamesDashboard({
  basePath,
  showId,
}: GamesDashboardProps) {
  const normalizedBasePath = basePath.endsWith("/")
    ? basePath.slice(0, -1)
    : basePath;
  const query = showId ? `?showId=${encodeURIComponent(showId)}` : "";

  const tiles: TileConfig[] = [
    {
      title: "Word Search",
      description: "Find hidden words from the show.",
      path: `${normalizedBasePath}/word-search${query}`,
      Icon: typeof FileText === "function" ? FileText : undefined,
      fallbackEmoji: "🧩",
      emojiLabel: "Word search puzzle",
    },
    {
      title: "Wordle World",
      description: "Guess the word related to the show.",
      // Remove "/games" from the path so it routes correctly
      path: `${normalizedBasePath.replace(/\/games$/, "")}/wordle${query}`,
      Icon: typeof Search === "function" ? Search : undefined,
      fallbackEmoji: "🔍",
      emojiLabel: "Magnifying glass",
    },
    {
      title: "Quiz",
      description: "Test your show knowledge with quick questions.",
      path: `${normalizedBasePath}/quiz${query}`,
      Icon: typeof HelpCircle === "function" ? HelpCircle : undefined,
      fallbackEmoji: "❓",
      emojiLabel: "Question mark",
    },
    {
      title: "Memory Match",
      description: "Flip cards and remember every match.",
      path: `${normalizedBasePath}/memory-match${query}`,
      Icon: typeof Brain === "function" ? Brain : undefined,
      fallbackEmoji: "🧠",
      emojiLabel: "Brain",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-black via-[#330008] to-black px-6 py-10 text-white">
      <div className="w-full max-w-5xl">
        <header className="text-center sm:text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">
            The Games Lounge
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Games
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Pick a game and dive into Oz while you wait for the next act.
          </p>
        </header>

        <section
          aria-label="Available patron games"
          className="mt-10 grid gap-6 sm:grid-cols-2"
        >
          {tiles.map(
            ({ title, description, path, Icon, fallbackEmoji, emojiLabel }) => (
              <Link
                key={path}
                href={path}
                aria-label={`Open ${title}`}
                className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-red-600/80 via-red-600/60 to-red-700/80 p-6 shadow-[0_20px_40px_-20px_rgba(255,0,0,0.5)] transition duration-200 hover:border-white/40 hover:shadow-[0_20px_60px_-20px_rgba(255,0,0,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="mt-2 text-sm text-white/70">{description}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
                    <IconRenderer
                      Icon={Icon}
                      fallbackEmoji={fallbackEmoji}
                      emojiLabel={emojiLabel}
                    />
                  </div>
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-white/70">
                  Tap to play →
                </div>
              </Link>
            )
          )}
        </section>
      </div>
    </main>
  );
}
