"use client";
import Link from "next/link";
import { Brain, Search, HelpCircle, FileText } from "lucide-react";

export default function GamesDashboard({ basePath }: { basePath: string }) {
  const tiles = [
    {
      href: `${basePath}/word-search`,
      title: "Word Search",
      desc: "Find hidden words from the show",
      Icon: FileText,
    },
    {
      href: `${basePath}/spot-the-difference`,
      title: "Spot the Difference",
      desc: "Can you spot them all?",
      Icon: Search,
    },
    {
      href: `${basePath}/quiz`,
      title: "Quiz",
      desc: "Test your knowledge",
      Icon: HelpCircle,
    },
    {
      href: `${basePath}/memory-match`,
      title: "Memory Match",
      desc: "Flip cards and find pairs",
      Icon: Brain,
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Games</h1>
      <p className="mt-2 text-sm text-gray-400">
        Choose a game to play during intermission.
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {tiles.map(({ href, title, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur transition hover:translate-y-[-2px] hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 p-3">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-medium">{title}</h2>
            </div>
            <p className="mt-3 text-sm text-gray-300">{desc}</p>
            <div className="mt-4 text-xs opacity-60">Tap to play →</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
